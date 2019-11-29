from flask_restful import Resource, abort
from flask import redirect, url_for

import config
from controller import worker_store as ws


class WorkerFixed(Resource):
    def get(self, hash):
        try:
            if self.fix_worker(hash):
                return redirect(url_for('worker_details', hash=hash))

            abort(403, message="Couldn't update worker")

        except Exception as e:
            if config.debug_mode:
                abort(400, message=str(e))

            else:
                abort(404, message="Page not found")

    @staticmethod
    def fix_worker(worker_id):
        worker = ws.get_worker(worker_id)
        changes = worker.error_solved()
        return ws.update_worker(changes, worker_id)
