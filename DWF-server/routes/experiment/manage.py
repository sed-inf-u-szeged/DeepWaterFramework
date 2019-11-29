from flask_restful import Resource, abort
from flask import render_template, make_response, request

import config
from controller import experiment_store as es
from controller import experiment_summary_store as ess
from controller import assemble_task_store as ats
from controller import learn_task_store as lts
from controller import task_store as ts
from controller import strategy_config_store as scs
from model import AssembleTask, LearnTask, Task
from model.experiment_summary import ExperimentSummary
from model.experiment_summary_task import ExperimentSummaryTask


class Manage(Resource):
    def post(self, hash):
        try:
            experiment = es.get_experiment(hash)
            if request.json['command'] == 'generate_tasks':
                changes = experiment.set_state("generating_tasks")
                success = es.update_experiment(changes, hash)
                generated_tasks = self.generate_tasks(experiment, hash)
                if generated_tasks:
                    success = success and self.init_summary(hash, experiment, generated_tasks)
                    changes = experiment.set_state("generated_tasks")
                    changes.update(experiment.add_task_list([t_id for t_id, _, _, _ in generated_tasks]))
                    success = success and es.update_experiment(changes, hash)
                    if success:
                        return make_response("generate_tasks_success", 200)

                else:
                    changes = experiment.set_state("configuration")
                    success = es.update_experiment(changes, hash)

                return make_response("generate_tasks_need_assembling", 200)

            elif request.json['command'] == 'run_all':
                success = True
                for t_id in experiment.tasks:
                    success = success and self.run_task(t_id)

                if success:
                    return make_response("run_success", 200)

                return make_response("run_failed", 200)

            elif request.json['command'] == 'run_task':
                task_id = request.json['id']
                success = self.run_task(task_id)
                if success:
                    return make_response("run_success", 200)

                return make_response("run_failed", 200)

            elif request.json['command'] == 'rerun_all':
                success = True
                tasks = []
                for t_id in experiment.tasks:
                    t_success, a_task, l_task = self.rerun_task(t_id)
                    if t_success:
                        tasks.append((t_id, self.create_summary_task(a_task, l_task)))

                    success = success and t_success

                exp_sum = ess.get_experiment_summary(hash)
                sum_changes = None
                for t_id, t in tasks:
                    sum_changes = exp_sum.update_task(t_id, t)

                if sum_changes:
                    success = success and ess.update_experiment_summary(sum_changes, hash)

                if success:
                    return make_response("rerun_success", 200)

                return make_response("rerun_failed", 200)

            elif request.json['command'] == 'rerun_task':
                task_id = request.json['id']
                success, a_task, l_task = self.rerun_task(task_id)
                if success:
                    exp_sum = ess.get_experiment_summary(hash)
                    sum_changes = exp_sum.update_task(task_id, self.create_summary_task(a_task, l_task))
                    if sum_changes:
                        success = ess.update_experiment_summary(sum_changes, hash)

                if success:
                    return make_response("rerun_success", 200)

                return make_response("rerun_failed", 200)

        except Exception as e:
            if config.debug_mode:
                abort(400, message=str(e))

            else:
                abort(404, message="Page not found")

    def init_summary(self, exp_id, exp, generated_tasks):
        summary_tasks = {t_id: self.create_summary_task(a_task, l_task) for t_id, t, a_task, l_task in generated_tasks}
        success = ess.new_experiment_summary(exp_id, ExperimentSummary(exp.name, exp.markdown, summary_tasks))
        return bool(success)

    @staticmethod
    def create_summary_task(a_task, l_task):
        a_conf = a_task.assemble_config if not l_task else l_task.assemble_config
        l_conf = None if not l_task else l_task.learn_config
        exp_sum = ExperimentSummaryTask(a_conf, l_conf)
        if a_task.is_completed():
            exp_sum.add_assemble_result(a_task.result_file_path)

        if l_task.is_completed():
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
        tasks = [self.load_task_from_db(t_id) for t_id in exp.tasks]
        learn_configs = [(c_id, scs.get_config_by_id(c_id)) for c_id in exp.learn_configs]
        result = {
            "name": exp.name,
            "markdown": exp.markdown,
            "state": exp.state,
            "assemble_configs": [(c_id, scs.get_config_by_id(c_id)) for c_id in exp.assemble_configs],
            "learn_configs": learn_configs,
            "tasks": tasks,
            "show_summary": learn_configs and [t for t in tasks if t['state'] == "completed"],
            "has_runnable_tasks": bool([t for t in tasks if t['state'] == "generated"]),
            "all_tasks_completed": not bool([t for t in tasks if t['state'] != "completed"]),
        }
        return result

    @staticmethod
    def load_task_from_db(task_id):
        task = ts.get_task_by_id(task_id)
        result = {
            "id": task_id,
            "state": task.state,
            "status_info": "Task Completed" if task.state == "completed" else "Run task",
        }
        assemble_task = ats.get_task_by_id(task.assemble_task_id)
        if task.learn_task_id:
            learn_task = lts.get_task_by_id(task.learn_task_id)
            result["learn_config"] = learn_task.learn_config
            if task.state == "running":
                if learn_task.state == "runnable":
                    if assemble_task.is_completed():
                        result["state"] = learn_task.state

                    result["status_info"] = "Learning is waiting for worker"
                elif learn_task.state == "running":
                    result["status_info"] = "Learning is in progress"

        result["assemble_config"] = assemble_task.assemble_config
        if task.state == "running":
            if assemble_task.state == "runnable":
                result["state"] = assemble_task.state
                result["status_info"] = "Assembling is waiting for worker"
            elif assemble_task.state == "running":
                result["status_info"] = "Assembling is in progress"

        return result

    @staticmethod
    def rerun_task(task_id):
        task = ts.get_task_by_id(task_id)

        a_task = ats.get_task_by_id(task.assemble_task_id)
        a_task_changes = a_task.make_obsolete()
        ats.update_task(a_task_changes, task.assemble_task_id)

        new_a_task = AssembleTask(a_task.assemble_config)
        new_a_task.make_runnable()
        new_a_task.add_parent(task_id)
        new_a_task_id, new_a_task = ats.new_assemble_task(new_a_task)

        if task.learn_task_id:
            l_task = lts.get_task_by_id(task.learn_task_id)
            l_task_changes = l_task.make_obsolete()
            lts.update_task(l_task_changes, task.learn_task_id)

            new_l_task = LearnTask(l_task.assemble_config, l_task.assemble_task_id, l_task.learn_config)
            new_l_task.make_runnable()
            new_l_task.add_parent(task_id)
            new_l_task_id, new_l_task = lts.new_learn_task(new_l_task)

            task_changes = task.re_run(new_a_task_id, new_l_task_id)
            return ts.update_task(task_changes, task_id), a_task, l_task

        else:
            task_changes = task.re_run(new_a_task_id, None)
            return ts.update_task(task_changes, task_id), a_task, None

    @staticmethod
    def generate_tasks(exp, exp_id):
        assemble_configs = [scs.get_config_by_id(c_id) for c_id in exp.assemble_configs]
        learn_configs = [scs.get_config_by_id(c_id) for c_id in exp.learn_configs]

        generated_tasks = []

        for a_conf in assemble_configs:
            a_conf_dict = a_conf.to_dict()
            a_conf_dict.pop('shared_parameters', None)
            a_task = AssembleTask(a_conf_dict)
            a_task_es_id, a_task = ats.new_assemble_task(a_task)
            if a_task_es_id:
                if not learn_configs:
                    task = Task(exp_id, a_task_es_id, None)
                    if a_task.is_completed():
                        task.completed(a_task_es_id)

                    task_id = ts.new_task(task)
                    if task_id:
                        generated_tasks.append((task_id, task, a_task, None))

                for l_conf in learn_configs:
                    l_task = LearnTask(a_conf.to_dict(), a_task_es_id, l_conf.to_dict())
                    l_task_es_id, l_task = lts.new_learn_task(l_task)
                    if l_task_es_id:
                        task = Task(exp_id, a_task_es_id, l_task_es_id)
                        if l_task.is_completed():
                            task.completed(l_task_es_id)

                        task_id = ts.new_task(task)
                        if task_id:
                            generated_tasks.append((task_id, task, a_task, l_task))

        return generated_tasks

    @staticmethod
    def run_task(task_id):
        task = ts.get_task_by_id(task_id)
        success = True
        if task and task.state == "generated":
            t_change = task.make_runnable()
            a_task = ats.get_task_by_id(task.assemble_task_id)
            a_task_change = a_task.add_parent(task_id)
            if a_task.is_completed():
                t_change.update(task.completed(task.assemble_task_id))

            else:
                a_task_change.update(a_task.make_runnable())

            success = success and ats.update_task(a_task_change, task.assemble_task_id)
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

        return success and task
