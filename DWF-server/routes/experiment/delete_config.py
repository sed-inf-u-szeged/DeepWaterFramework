from flask_restful import Resource, abort
from flask import make_response, request

import config
from controller import experiment_store as es


class DeleteConfig(Resource):
    @staticmethod
    def post():
        try:
            success = es.remove_config(request.json['hash'], request.json['id'])
            return make_response(request.json['id']) if success else make_response('')

        except Exception as e:
            if config.debug_mode:
                abort(400, message=str(e))

            else:
                abort(404, message="Page not found")
