from flask_restful import Resource, abort
from flask import render_template, make_response, request

import config
from controller import experiment_store as es
from controller import worker_store as ws
from controller import experiment_summary_store as ess
from controller import assemble_task_store as ats
from controller import learn_task_store as lts
from controller import task_store as ts
from controller.task_scheduler import scheduler
from controller import strategy_config_store as scs
from model import AssembleTask, LearnTask, Task
from model.experiment_summary import ExperimentSummary
from model.experiment_summary_task import ExperimentSummaryTask


class Manage(Resource):
    def post(self, hash):
        try:
            experiment = es.get_experiment(hash)
            if request.json['command'] == 'generate_tasks':
                success = self.generate_tasks(experiment, hash)
                return make_response("generate_tasks_success" if success else "generate_tasks_need_assembling", 200)

            elif request.json['command'] == 'run_all':
                success = self.run_all_tasks(experiment)
                if success:
                    scheduler.add_experiment(hash, experiment.priority)

                return make_response("run_success" if success else "run_failed", 200)

            elif request.json['command'] == 'run_task':
                success = self.run_task(request.json['id'])
                if success:
                    scheduler.add_experiment(hash, experiment.priority)

                return make_response("run_success" if success else "run_failed", 200)

            elif request.json['command'] == 'rerun_all':
                success = self.rerun_all_tasks(experiment, hash)
                if success:
                    scheduler.add_experiment(hash, experiment.priority)

                return make_response("rerun_success" if success else "rerun_failed", 200)

            elif request.json['command'] == 'rerun_task':
                success = self.rerun_task(hash, request.json['id'])
                if success:
                    scheduler.add_experiment(hash, experiment.priority)

                return make_response("rerun_success" if success else "rerun_failed", 200)

            elif request.json['command'] == 'stop_all':
                success = self.stop_all_tasks(experiment)
                if success:
                    scheduler.remove_experiment(hash)

                return make_response("stop_success" if success else "stop_failed", 200)

            elif request.json['command'] == 'stop_task':
                success = self.stop_task(request.json['id'])
                scheduler.check_experiment(hash, experiment.priority)
                return make_response("stop_success" if success else "stop_failed", 200)

            elif request.json['command'] == 'reorder_task':
                success = self.reorder_task(request.json['id'], request.json['direction'] == "up")
                return make_response("reorder_success" if success else "reorder_failed", 200)

            elif request.json['command'] == 'delete_experiment':
                success = self.stop_all_tasks(experiment)
                if success:
                    scheduler.remove_experiment(hash)

                success = success and es.delete_experiment(hash)
                if ess.get_experiment_summary(hash):
                    success = success and ess.delete_experiment_summary(hash)

                return make_response(f"delete_success" if success else f"delete_failed", 200)

            else:
                abort(400, message="Unknown command.")

        except Exception as e:
            if config.debug_mode:
                abort(400, message=str(e))

            else:
                abort(404, message="Page not found")

    def init_summary(self, exp_id, exp, generated_tasks):
        summary_tasks = {t_id: self.create_summary_task(a_task, l_task, t.created_ts) for t_id, t, a_task, l_task in generated_tasks}
        success = ess.new_experiment_summary(
            exp_id,
            ExperimentSummary(exp.name, exp.markdown, summary_tasks, exp.created_ts)
        )
        return bool(success)

    @staticmethod
    def create_summary_task(a_task, l_task, created_ts):
        a_conf = (l_task or a_task).assemble_config
        l_conf = None if not l_task else l_task.learn_config
        exp_sum = ExperimentSummaryTask(a_conf, l_conf, created_ts)
        if a_task.is_completed():
            exp_sum.add_assemble_result(a_task.result_file_path)

        if l_task and l_task.is_completed():
            exp_sum.add_learn_result(l_task.result)

        if a_conf['strategy_id'] == "manual_file_input":
            exp_sum.add_assemble_result(a_conf['strategy_parameters']['file_path'])

        return exp_sum

    def get(self, hash):
        try:
            experiment = es.get_experiment(hash)
            return make_response(
                render_template(
                    'experiment/manage.j2',
                    hash=hash,
                    experiment=self.load_experiment(experiment)
                ),
                200,
                {'Content-Type': 'text/html'}
            )

        except Exception as e:
            if config.debug_mode:
                abort(400, message=str(e))

            else:
                abort(404, message="Page not found")

    def load_experiment(self, exp):
        tasks = sorted([self.load_task_from_db(t_id) for t_id in exp.tasks], key=lambda t: t["order_in_exp"])
        learn_configs = [(c_id, scs.get_config_by_id(c_id)) for c_id in exp.learn_configs]
        runnable_tasks = [t for t in tasks if t['state'] == "generated"]
        stoppable_tasks = [t for t in tasks if t['state'] == "runnable" or t['state'] == "running"]
        result = {
            "name": exp.name,
            "markdown": exp.markdown,
            "state": exp.state,
            "assemble_configs": [(c_id, scs.get_config_by_id(c_id)) for c_id in exp.assemble_configs],
            "learn_configs": learn_configs,
            "tasks": tasks,
            "show_summary": learn_configs and [t for t in tasks if t['state'] == "completed"],
            "has_runnable_tasks": bool(runnable_tasks),
            "has_stoppable_tasks": bool(stoppable_tasks),
            "all_tasks_completed": not runnable_tasks and not stoppable_tasks,
        }
        return result

    @staticmethod
    def load_task_from_db(task_id):
        task = ts.get_task_by_id(task_id)
        result = {
            "id": task_id,
            "state": task.state,
            "order_in_exp": task.order_in_exp,
            "status_info": "Task Completed" if task.state == "completed" else "Run task",
        }
        assemble_task = ats.get_task_by_id(task.assemble_task_id)
        if task.learn_task_id:
            learn_task = lts.get_task_by_id(task.learn_task_id)
            result["learn_config"] = learn_task.learn_config
            if task.state == "runnable" or task.state == "running":
                if learn_task.state == "runnable":
                    result["status_info"] = "Learning is waiting for worker"

                elif learn_task.state == "running":
                    result["status_info"] = "Learning is in progress"

        result["assemble_config"] = assemble_task.assemble_config
        if task.state == "runnable" or task.state == "running":
            if assemble_task.state == "runnable":
                result["status_info"] = "Assembling is waiting for worker"

            elif assemble_task.state == "running":
                result["status_info"] = "Assembling is in progress"

        return result

    def rerun_task(self, exp_id, task_id):
        exp_sum = ess.get_experiment_summary(exp_id)
        success, task, a_task, l_task = self._rerun_task(task_id)
        if success:
            sum_changes = exp_sum.update_task(task_id, self.create_summary_task(a_task, l_task, task.created_ts))
            success = ess.update_experiment_summary(sum_changes, exp_id)

        return success

    def rerun_all_tasks(self, exp, exp_id):
        exp_sum = ess.get_experiment_summary(exp_id)
        sum_changes = None
        success = True
        for t_id in exp.tasks:
            t_success, task, a_task, l_task = self._rerun_task(t_id)
            if t_success:
                sum_changes = exp_sum.update_task(t_id, self.create_summary_task(a_task, l_task, task.created_ts))

        if sum_changes:
            success = success and ess.update_experiment_summary(sum_changes, exp_id)

        return success

    @staticmethod
    def _rerun_task(task_id):
        task = ts.get_task_by_id(task_id)

        if task.state != "completed":
            return None, None, None, None

        new_a_task_id, new_a_task = ats.rerun_task(task.assemble_task_id)
        if not new_a_task:
            return None, None, None, None

        if task.learn_task_id:
            new_l_task_id, new_l_task = lts.rerun_task(task.learn_task_id, new_a_task_id)
            task_changes = task.re_run(new_a_task_id, new_l_task_id)
            return ts.update_task(task_changes, task_id), task, new_a_task, new_l_task

        else:
            task_changes = task.re_run(new_a_task_id, None)
            return ts.update_task(task_changes, task_id), task, new_a_task, None

    def generate_tasks(self, exp, exp_id):
        changes = exp.set_state("generating_tasks")
        success = es.update_experiment(changes, exp_id)
        try:
            generated_tasks_data = self.generate_tasks_data(exp, exp_id)
            if generated_tasks_data:
                success = success and self.init_summary(exp_id, exp, generated_tasks_data)
                changes = exp.set_state("generated_tasks")
                changes.update(exp.add_task_list([t_id for t_id, _, _, _ in generated_tasks_data]))
                if success:
                    success = success and es.update_experiment(changes, exp_id)
                    return True

        except Exception as e:
            pass

        changes = exp.set_state("configuration")
        success = es.update_experiment(changes, exp_id)
        return False

    @staticmethod
    def generate_tasks_data(exp, exp_id):
        assemble_configs = [scs.get_config_by_id(c_id) for c_id in exp.assemble_configs]
        learn_configs = [scs.get_config_by_id(c_id) for c_id in exp.learn_configs]

        generated_tasks = []

        index = 1

        for a_conf in assemble_configs:
            a_conf_dict = a_conf.to_dict()
            a_conf_dict.pop('shared_parameters', None)
            a_task = AssembleTask(a_conf_dict)
            a_task_es_id, a_task = ats.new_assemble_task(a_task)
            if a_task_es_id:
                if not learn_configs:
                    if a_task.assemble_config['strategy_id'] != "manual_file_input":
                        task = Task(exp_id, a_task_es_id, None, index)
                        index += 1
                        if a_task.is_completed():
                            task.completed(a_task_es_id)

                        task_id = ts.new_task(task)
                        if task_id:
                            generated_tasks.append((task_id, task, a_task, None))

                for l_conf in learn_configs:
                    l_task = LearnTask(a_conf.to_dict(), a_task_es_id, l_conf.to_dict())
                    l_task_es_id, l_task = lts.new_learn_task(l_task)
                    if l_task_es_id:
                        task = Task(exp_id, a_task_es_id, l_task_es_id, index)
                        index += 1
                        if l_task.is_completed():
                            task.completed(l_task_es_id)

                        task_id = ts.new_task(task)
                        if task_id:
                            generated_tasks.append((task_id, task, a_task, l_task))

        return generated_tasks

    def run_all_tasks(self, exp):
        success = True
        for t_id in exp.tasks:
            success = self.run_task(t_id) or success

        return success

    @staticmethod
    def run_task(task_id):
        task = ts.get_task_by_id(task_id)
        if not task or task.state != "generated":
            return False

        t_change = task.make_runnable()
        a_task = ats.get_task_by_id(task.assemble_task_id)
        a_task_change = a_task.add_parent(task_id)
        if a_task.is_completed():
            t_change.update(task.completed(task.assemble_task_id))

        else:
            a_task_change.update(a_task.make_runnable())

        success = ats.update_task(a_task_change, task.assemble_task_id)
        if success and task.learn_task_id:
            l_task = lts.get_task_by_id(task.learn_task_id)
            l_task_change = l_task.add_parent(task_id)
            if l_task.is_completed():
                t_change = task.completed(task.learn_task_id)

            else:
                l_task_change.update(l_task.make_runnable())

            success = lts.update_task(l_task_change, task.learn_task_id)

        if success:
            success = ts.update_task(t_change, task_id)

        return success

    def stop_all_tasks(self, exp):
        success = True
        for t_id in exp.tasks:
            success = self._stop_task(t_id) or success

        return success

    def stop_task(self, task_id):
        return self._stop_task(task_id)

    def _stop_task(self, task_id):
        task = ts.get_task_by_id(task_id)

        if task.state != "running":
            return None

        self._stop_sub_task(task_id, task.assemble_task_id, ats)

        if task.learn_task_id:
            self._stop_sub_task(task_id, task.learn_task_id, lts)

        task_changes = task.stop()
        return ts.update_task(task_changes, task_id)

    @staticmethod
    def _stop_sub_task(parent_task_id, sub_task_id, task_store):
        sub_task = task_store.get_task_by_id(sub_task_id)
        worker_id = sub_task.assigned_to
        sub_task_changes = sub_task.stop(parent_task_id)
        if sub_task_changes:
            task_store.update_task(sub_task_changes, sub_task_id)
            if not sub_task.assigned_to:
                worker = ws.get_worker(worker_id)
                if worker:
                    worker_changes = worker.clear_task()
                    ws.update_worker(worker_changes, worker_id)

    @staticmethod
    def reorder_task(task_id, direction):
        try:
            task = ts.get_task_by_id(task_id)
            task_order = task.order_in_exp
            swap_order = task_order + (-1 if direction else 1)
            swap_task_id, swap_task = ts.search_task_by_dict({
                'order_in_exp': swap_order,
                'experiment_id': task.experiment_id,
            })
            task_changes = task.set_order_in_exp(swap_order)
            success = ts.update_task(task_changes, task_id)
            swap_task_changes = swap_task.set_order_in_exp(task_order)
            return ts.update_task(swap_task_changes, swap_task_id) and success

        except Exception as e:
            pass

        return False
