from flask_restful import Resource, abort
from flask import render_template, make_response, request

from controller import worker_store as ws


class WorkerList(Resource):
    @staticmethod
    def get():
        return make_response(
            render_template(
                'worker_list.j2',
                workers=ws.list_workers(),
                reload=True
            ),
            200,
            {'Content-Type': 'text/html'}
        )

    @staticmethod
    def post():
        try:
            if request.json['command'] == 'delete_worker':
                success = ws.delete_worker(request.json['worker_id'])
                return make_response("delete_success" if success else "delete_failed", 200)

        except Exception as e:
            pass

        abort(400, message="Unknown command.")
