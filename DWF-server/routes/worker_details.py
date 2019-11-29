from flask_restful import Resource, abort
from flask import render_template, make_response

import config
from controller import worker_store as ws
from controller import task_store as ts
from controller import assemble_task_store as ats
from controller import learn_task_store as lts


class WorkerDetails(Resource):
    def get(self, hash):
        try:
            return make_response(
                render_template(
                    'worker_details.j2',
                    worker_id=hash,
                    worker=self.load_worker(hash)
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
    def load_worker(worker_id):
        worker = ws.get_worker(worker_id)
        result = worker.__dict__
        if worker.current_task_id:
            task = ats.get_task_by_id(worker.current_task_id)
            if task:
                result['is_assembling'] = True

            else:
                task = lts.get_task_by_id(worker.current_task_id)

            parent_tasks = [(t_id, ts.get_task_by_id(t_id)) for t_id in task.parent_tasks]
            running_task_ids = [t_id for t_id, t in parent_tasks if t.state == "running"]
            result['task_ids'] = running_task_ids
            if len(running_task_ids) > 1:
                result['is_working_on_multiple_tasks'] = True

            result['log'] = task.log

        return result
