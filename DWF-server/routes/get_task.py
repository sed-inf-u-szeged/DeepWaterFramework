import concurrent.futures

from flask_restful import Resource
from flask import jsonify, make_response, g

import config
from middleware import validate_hash
from controller import worker_store as ws

from multiprocessing import Process

executor = concurrent.futures.ThreadPoolExecutor()

class GetTask(Resource):
    method_decorators = [validate_hash]

    def post(self):
        try:
            return make_response(jsonify({'task': self.get_task()}), 200)

        except Exception as e:
            if config.debug_mode:
                return make_response(str(e), 400)

            else:
                return make_response('', 400)

    @staticmethod
    def get_task():
        ws.ping_worker(g.hash, g.worker)
        f = executor.submit(ws.assign_task_to_worker, g.hash, g.worker)
        assigned_task_id, assigned_task = f.result()
        return assigned_task or ''
