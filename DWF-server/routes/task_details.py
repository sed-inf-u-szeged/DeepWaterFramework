from flask_restful import Resource
from flask import render_template, make_response

from controller import task_store as ts
from controller import experiment_store as es
from controller import assemble_task_store as ats
from controller import learn_task_store as lts


class TaskDetails(Resource):
    def get(self, hash):
        return make_response(
            render_template(
                'task_details.j2',
                task_id=hash,
                task=self.load_task(hash)
            ),
            200,
            {'Content-Type': 'text/html'}
        )

    @staticmethod
    def load_task(task_id):
        task = ts.get_task_by_id(task_id)
        exp = es.get_experiment(task.experiment_id)
        result = task.__dict__
        result['experiment_name'] = exp.name
        a_task = ats.get_task_by_id(task.assemble_task_id)
        result['assemble_config'] = a_task.assemble_config
        if not a_task.is_completed():
            result['assigned_to'] = a_task.assigned_to

        else:
            result['result'] = a_task.result_file_path

        result['progress'] = a_task.progress or 0.0
        result['task_in_progress'] = 'assembling'
        if task.learn_task_id:
            l_task = lts.get_task_by_id(task.learn_task_id)
            result['assemble_config'] = l_task.assemble_config
            result['learn_config'] = l_task.learn_config
            result['progress'] = round((((a_task.progress or 0.0) + (l_task.progress or 0.0)) / 2.0) * 100, 2)
            result['task_in_progress'] = 'learning' if l_task.state == "running" or a_task.state == "completed" else 'assembling'
            result['result'] = l_task.result
            if l_task.assigned_to and not l_task.is_completed():
                result['assigned_to'] = l_task.assigned_to

        return result
