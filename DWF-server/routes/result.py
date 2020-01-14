from flask_restful import abort, Resource
from flask import request, jsonify, make_response, g

import config
from middleware import validate_task
from middleware import validate_hash
from controller import worker_store as ws
from controller import experiment_summary_store as ess
from controller import assemble_task_store as ats
from controller import learn_task_store as lts
from controller import task_store as ts


class Result(Resource):
    method_decorators = [validate_task, validate_hash]

    def post(self):
        try:
            result = self.set_result(request.json)
            if not result:
                abort(400, message="Couldn't save result!")

            response = {'hash': g.hash}
            return make_response(jsonify(response), 200)

        except Exception as e:
            if config.debug_mode:
                abort(404, message=str(e))

            else:
                abort(404, message="Page not found")

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
                    if p_task.experiment_id in experiments:
                        exp = experiments[p_task.experiment_id]

                    else:
                        exp = ess.get_experiment_summary(p_task.experiment_id)
                        if exp:
                            experiments[p_task.experiment_id] = exp

                    if job_type == "assembling":
                        exp_change = exp.set_assemble_result(p_task_id, result)

                    else:
                        exp_change = exp.set_learn_result(p_task_id, result)

                    success = success and ess.update_experiment_summary(exp_change, p_task.experiment_id)
                    change = p_task.completed(task_id)
                    success = success and ts.update_task(change, p_task_id)

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
