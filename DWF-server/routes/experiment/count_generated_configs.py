from flask_restful import Resource, abort
from flask import make_response, request, jsonify

import config
from model import config_builder as cb


class CountGeneratedConfigs(Resource):
    @staticmethod
    def post():
        try:
            if request.json['strategy_type'] == "assembler_strategies":
                conf_list, error = cb.generate_assemble_configs(form_data=request.json)

            else:
                conf_list, error = cb.generate_learn_configs(form_data=request.json)

            return make_response(error or str(len(conf_list or [])), 200)

        except Exception as e:
            if config.debug_mode:
                abort(400, message=str(e))

            else:
                abort(404, message="Page not found")
