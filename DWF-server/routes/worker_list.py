from flask_restful import Resource
from flask import render_template, make_response

from controller import worker_store as ws


class WorkerList(Resource):
    def get(self):
        return make_response(
            render_template(
                'worker_list.j2',
                workers=ws.list_workers(),
                reload=True
            ),
            200,
            {'Content-Type': 'text/html'}
        )
