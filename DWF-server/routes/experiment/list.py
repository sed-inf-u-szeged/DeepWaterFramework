from flask_restful import Resource, abort
from flask import render_template, make_response

import config
from controller import experiment_store as es
from controller import task_store as ts
from model import Priority


class List(Resource):
    def get(self):
        try:
            return make_response(
                render_template(
                    'experiment/list.j2',
                    experiments=self.load_experiments(),
                    reload=True
                ),
                200,
                {'Content-Type': 'text/html'}
            )

        except Exception as e:
            if config.debug_mode:
                abort(400, message=str(e))

            else:
                abort(404, message="Page not found")

    @staticmethod
    def load_experiments():
        exp_list = es.list_experiments()
        result = []
        for exp_id, exp in exp_list:
            task_list = [ts.get_task_by_id(t_id) for t_id in exp.tasks]
            exp_dict = exp.__dict__
            exp_dict['priority'] = Priority.to_str(exp.priority)
            exp_dict['tasks_running'] = len([t for t in task_list if t.state == "running"])
            exp_dict['tasks_completed'] = len([t for t in task_list if t.state == "completed"])
            exp_dict['tasks_total'] = len(task_list)
            exp_dict['progress'] = round((exp.tasks_completed / (exp.tasks_total or 1)) * 100, 2)
            result.append((exp_id, exp_dict))

        return result
