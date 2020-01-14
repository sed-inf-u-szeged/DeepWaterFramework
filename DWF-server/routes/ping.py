from flask_restful import Resource
from flask import jsonify, make_response, g

import config
from middleware import validate_hash
from controller import worker_store as ws


class Ping(Resource):
    method_decorators = [validate_hash]

    @staticmethod
    def post():
        try:
            ws.ping_worker(g.hash, g.worker)
            return make_response(jsonify({'hash': g.hash, 'working': bool(g.worker.current_task_id)}), 200)

        except Exception as e:
            if config.debug_mode:
                return make_response(str(e), 404)

            else:
                return make_response('', 404)
