from flask_restful import Resource, abort
from flask import request, jsonify, make_response

import config
from controller import worker_store as ws


class Register(Resource):
    @staticmethod
    def post():
        try:
            if not request.json['platform_info'] or not request.json['environment']:
                abort(403, message="Platform or environment info is missing.")

            w_hash = ws.register_worker(request.json['platform_info'], request.json['environment'])
            if w_hash:
                return make_response(jsonify({'hash': w_hash}), 200)

            abort(400, message="Could not register")

        except Exception as e:
            if config.debug_mode:
                return make_response(str(e), 404)

            else:
                return make_response('', 404)
