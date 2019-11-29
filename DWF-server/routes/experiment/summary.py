from flask_restful import Resource
from flask import render_template, make_response

from controller import experiment_store as es
from controller import task_store as ts
from controller import learn_task_store as lts


class Summary(Resource):
    def get(self, hash):
        experiment, error_msg = self.load_experiment(hash)
        return make_response(
            render_template(
                'experiment/summary.j2',
                hash=hash,
                experiment=experiment,
                error_msg=error_msg,
            ),
            200,
            {'Content-Type': 'text/html'}
        )

    @staticmethod
    def load_experiment(exp_id):
        exp = es.get_experiment(exp_id)
        if exp:
            tasks = []
            only_assembling = True
            for task_id in exp.tasks:
                task = ts.get_task_by_id(task_id)
                if task.learn_task_id:
                    only_assembling = False
                    l_task = lts.get_task_by_id(task.learn_task_id)
                    if l_task.result:
                        tasks.append({
                            'id': task_id,
                            'name': f'{l_task.assemble_config["strategy_name"]} + {l_task.learn_config["strategy_name"]}',
                            'result': l_task.result,
                        })

            if only_assembling:
                return None, 'No learning task in experiment.'

            if tasks:
                return {'tasks': tasks}, ''

            return None, 'No task completed yet.'

        return None, None
