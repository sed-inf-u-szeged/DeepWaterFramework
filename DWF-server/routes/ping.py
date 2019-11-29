from flask_restful import Resource
from flask import request, jsonify, make_response, g

import config
from middleware import validate_hash
from controller import worker_store as ws


class Ping(Resource):
    method_decorators = [validate_hash]

    def post(self):
        try:
            response = {'hash': g.hash, 'task': self.get_task()}
            return make_response(jsonify(response), 200)

        except Exception as e:
            if config.debug_mode:
                return make_response(str(e), 404)

            else:
                return make_response('', 404)

    @staticmethod
    def get_task():
        worker = ws.get_worker(g.hash)
        ws.ping_worker(g.hash, worker)

        assigned_task_id, assigned_task = ws.assign_task_to_worker(g.hash, worker)
        return assigned_task or ''
