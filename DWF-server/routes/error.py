from flask_restful import abort, Resource
from flask import request, jsonify, make_response, g

import config
from middleware import validate_task, validate_hash
from controller import worker_store as ws


class Error(Resource):
    method_decorators = [validate_task, validate_hash]

    def post(self):
        try:
            success = self.remove_current_task(g.hash, request.json)
            if not success:
                abort(400, message="Couldn't report error!")

            return make_response(jsonify({'hash': g.hash}), 200)

        except Exception as e:
            if config.debug_mode:
                return make_response(jsonify({'hash': '', 'error': str(e)}))

            else:
                return make_response(jsonify({'hash': '', 'error': True}))

    @staticmethod
    def remove_current_task(worker_id, json):
        worker = ws.get_worker(g.hash)
        ws.ping_worker(g.hash, worker)
        return ws.worker_error(worker_id, worker, json['log'])
