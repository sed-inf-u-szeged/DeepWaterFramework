from flask_restful import Resource
from flask import make_response, request

from controller import experiment_store as es


class CheckName(Resource):
    @staticmethod
    def post():
        try:
            if request.json['name']:
                e = es.get_experiment_by_name(request.json['name'])
                if not e:
                    return make_response(request.json['name'], 200)

        except Exception as e:
            pass

        return make_response("no", 200)
