from flask_restful import abort
from flask import request, g
from functools import wraps

from controller import worker_store as ws


def validate_hash(f):
    @wraps(f)
    def func_wrapper(*args, **kwargs):
        json = request.get_json()
        if not json or 'hash' not in json or (json['hash'] and not ws.is_worker(json['hash'])):
            abort(400, message="Unknown worker id.")

        if not json['hash']:
            if not json['platform_info'] or not json['environment']:
                abort(403, message="Platform info is missing.")

            g.hash = ws.register_worker(json['platform_info'], json['environment'])

        else:
            g.hash = json['hash']

        return f(*args, **kwargs)

    return func_wrapper
