from flask_restful import Resource
from flask import request, jsonify, make_response, g

import config
from middleware import validate_task, validate_hash
from controller import worker_store as ws


class Error(Resource):
    method_decorators = [validate_task, validate_hash]

    def post(self):
        try:
            response = {'hash': g.hash, 'success': True if self.remove_current_task(g.hash, request.json) else False}
            return make_response(jsonify(response), 200)

        except Exception as e:
            if config.debug_mode:
                return make_response(str(e), 404)

            else:
                return make_response('', 404)

    @staticmethod
    def remove_current_task(worker_id, json):
        worker = ws.get_worker(g.hash)
        ws.ping_worker(g.hash, worker)
        return ws.worker_error(worker_id, worker, json['log'])
