from flask_restful import Resource
from flask import jsonify, make_response, g

from middleware import validate_hash
from controller import worker_store as ws


class GetTask(Resource):
    method_decorators = [validate_hash]

    def post(self):
        try:
            task = self.get_task()

        except Exception as e:
            task = ''

        return make_response(jsonify({'task': task}), 200)

    @staticmethod
    def get_task():
        ws.ping_worker(g.hash, g.worker)
        assigned_task_id, assigned_task = ws.assign_task_to_worker(g.hash, g.worker)
        return assigned_task or ''
