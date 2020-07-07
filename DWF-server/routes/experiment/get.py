from flask_restful import Resource, abort
from flask import make_response

import config
from controller import experiment_store as es


class Get(Resource):
    def get(self, name):
        try:
            exp_id = es.get_experiment_by_name(name)
            return make_response(exp_id, 200)

        except Exception as e:
            if config.debug_mode:
                abort(400, message=str(e))

            else:
                abort(404, message="Page not found")
