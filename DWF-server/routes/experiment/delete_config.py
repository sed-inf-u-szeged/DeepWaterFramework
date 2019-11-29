from flask_restful import Resource, abort
from flask import make_response, request

import config
from controller import experiment_store as es


class DeleteConfig(Resource):
    @staticmethod
    def post():
        try:
            e = es.get_experiment(request.json['hash'])
            change = e.remove_config(request.json['id'])
            if change:
                es_id = es.update_experiment(change, request.json['hash'])
                if es_id:
                    return make_response(request.json['id'])

            return make_response('', 200)

        except Exception as e:
            if config.debug_mode:
                abort(400, message=str(e))

            else:
                abort(404, message="Page not found")
