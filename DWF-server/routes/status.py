from flask_restful import abort, Resource
from flask import request, jsonify, make_response, g

import config
from controller import assemble_task_store as ats
from controller import learn_task_store as lts
from middleware import validate_task
from middleware import validate_hash


class Status(Resource):
    method_decorators = [validate_task, validate_hash]

    def post(self):
        try:
            status = self.set_status(request.json)
            if not status:
                abort(403, message="progress or message is missing or not types of float and string")

            response = {'hash': g.hash}
            return make_response(jsonify(response), 200)

        except Exception as e:
            if config.debug_mode:
                abort(404, message=str(e))

            else:
                abort(404, message="Page not found")

    def set_status(self, json):
        progress = max(.0, min(1., float(json['progress'])))
        message = str(json['message'])
        success = self.persist_status(ats, g.worker.current_task_id, progress, message)
        if not success:
            success = self.persist_status(lts, g.worker.current_task_id, progress, message)

        return success

    @staticmethod
    def persist_status(task_store, task_id, progress, message):
        try:
            task = task_store.get_task_by_id(task_id)
            change = task.add_log(progress, message)
            return task_store.update_task(change, task_id)

        except:
            return False
