from flask_restful import abort
from flask import request, g
from functools import wraps

from controller import worker_store as ws


def validate_hash(f):
    @wraps(f)
    def func_wrapper(*args, **kwargs):
        try:
            worker = ws.get_worker(request.json['hash'])
            if worker:
                g.worker = worker
                g.hash = request.json['hash']
                return f(*args, **kwargs)

        except Exception as e:
            pass

        abort(400, message="Unknown worker id.")
        return None

    return func_wrapper
