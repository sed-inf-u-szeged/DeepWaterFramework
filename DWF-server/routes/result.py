from flask_restful import abort, Resource
from flask import request, jsonify, make_response, g

import config
from middleware import validate_task
from middleware import validate_hash
from controller import worker_store as ws
from controller import experiment_store as es
from controller import experiment_summary_store as ess
from controller import assemble_task_store as ats
from controller import learn_task_store as lts
from controller import task_store as ts
from controller.task_scheduler import scheduler


class Result(Resource):
    method_decorators = [validate_task, validate_hash]

    def post(self):
        try:
            result = self.set_result(request.json)
            if not result:
                abort(400, message="Couldn't save result!")

            return make_response(jsonify({'hash': g.hash}), 200)

        except Exception as e:
            if config.debug_mode:
                return make_response(jsonify({'hash': '', 'error': str(e)}))

            else:
                return make_response(jsonify({'hash': '', 'error': True}))

    def set_result(self, json):
        result = self.persist_result(
            "assembling",
            ats,
            g.worker.current_task_id,
            self.get_assemble_result,
            json['result']
        ) or self.persist_result(
            "learning",
            lts,
            g.worker.current_task_id,
            self.get_learn_result,
            json['result']
        )

        if result:
            changes = g.worker.clear_task()
            success = ws.update_worker(changes, g.hash)
            if success:
                return result

        return False

    @staticmethod
    def persist_result(job_type, task_store, task_id, get_result_func, result):
        try:
            result = get_result_func(result)
            if result:
                experiments = {}
                task = task_store.get_task_by_id(task_id)
                change = task.completed(result)
                success = task_store.update_task(change, task_id)
                parent_tasks = [(t_id, ts.get_task_by_id(t_id)) for t_id in task.parent_tasks]
                for p_task_id, p_task in parent_tasks:
                    if not p_task:
                        continue

                    change = p_task.completed(task_id)
                    success = ts.update_task(change, p_task_id) and success
                    if p_task.experiment_id in experiments:
                        exp_sum = experiments[p_task.experiment_id]

                    else:
                        if p_task.learn_task_id:
                            exp = es.get_experiment(p_task.experiment_id)
                            if exp:
                                scheduler.check_experiment(p_task.experiment_id, exp.priority)

                        exp_sum = ess.get_experiment_summary(p_task.experiment_id)
                        if exp_sum:
                            experiments[p_task.experiment_id] = exp_sum

                    if job_type == "assembling":
                        exp_change = exp_sum.set_assemble_result(p_task_id, result)

                    else:
                        exp_change = exp_sum.set_learn_result(p_task_id, result)

                    success = ess.update_experiment_summary(exp_change, p_task.experiment_id) and success

                return bool(success)

        except Exception as e:
            return False

    @staticmethod
    def get_assemble_result(result):
        try:
            return str(result)

        except:
            return False

    @staticmethod
    def get_learn_result(result):
        try:
            return {
                'train': result['train'],
                'dev': result['dev'],
                'test': result['test'],
            }

        except:
            return False
