from flask_restful import abort
from flask import g
from functools import wraps

from controller import worker_store as ws


def validate_task(f):
    @wraps(f)
    def func_wrapper(*args, **kwargs):
        if not g.hash:
            abort(400, message="Worker id is missing.")

        working = ws.is_working(g.hash)
        if not working:
            abort(404, message="No task assigned to this worker id.")

        return f(*args, **kwargs)

    return func_wrapper
