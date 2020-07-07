from common import timestamp_ms
from model.obj_flatten import flatten


class AssembleTask:
    def __init__(self, assemble_config, order_in_exp=0):
        self.assemble_config = assemble_config
        self.order_in_exp = order_in_exp
        # state values: "generated", "runnable", "running", "completed"
        self.state = "generated"
        self.assigned_to = None
        self.result_file_path = None
        self.created_ts = timestamp_ms()
        self.completed_ts = None
        self.progress = None
        self.log = None
        self.up_to_date = True

    @classmethod
    def from_es_data(cls, task):
        res = cls(
            assemble_config=task['assemble_config'],
            order_in_exp=task['order_in_exp'],
        )
        res.state = task['state']
        res.assigned_to = task['assigned_to']
        res.result_file_path = task['result_file_path']
        res.created_ts = task['created_ts']
        res.completed_ts = task['completed_ts']
        res.progress = task['progress']
        res.log = task['log']
        return res

    def make_obsolete(self):
        if self.up_to_date:
            self.up_to_date = False

        return {
            'up_to_date': self.up_to_date
        }

    def stop(self):
        if self.state != "completed":
            self.state = "generated"
            self.assigned_to = None
            self.result_file_path = None
            self.completed_ts = None
            self.progress = None
            self.log = None

        return {
            'state': self.state,
            'assigned_to': self.assigned_to,
            'result_file_path': self.result_file_path,
            'completed_ts': self.completed_ts,
            'progress': self.progress,
            'log': self.log,
        }

    def make_runnable(self):
        if self.state == "generated":
            self.state = "runnable"

        return {
            'state': self.state,
        }

    def revoke_assign_from(self, worker_id):
        if worker_id and worker_id == self.assigned_to:
            self.assigned_to = None
            self.state = "runnable"
            self.progress = 0.0
            self.log = []

        return {
            'assigned_to': self.assigned_to,
            'state': self.state,
            'progress': self.progress,
            'log': self.log,
        }

    def assign_to(self, worker_id):
        if worker_id:
            self.assigned_to = worker_id
            self.state = "running"
            self.progress = 0.0
            self.log = []

        return {
            'assigned_to': self.assigned_to,
            'state': self.state,
            'progress': self.progress,
            'log': self.log,
        }

    def is_completed(self):
        return self.state == "completed"

    def completed(self, result):
        if result:
            self.result_file_path = result
            self.progress = 1.
            self.completed_ts = timestamp_ms()
            self.state = "completed"

        return {
            'result_file_path': self.result_file_path,
            'progress': self.progress,
            'completed_ts': self.completed_ts,
            'state': self.state,
        }

    def add_log(self, progress, message):
        self.progress = progress
        self.log.append({
            "timestamp": timestamp_ms(),
            "message": message,
        })
        return {
            'progress': self.progress,
            'log': self.log,
        }

    def set_order_in_exp(self, order_in_exp):
        self.order_in_exp = order_in_exp
        return {'order_in_exp': self.order_in_exp}

    def flatten(self):
        return flatten({
            'assemble_config': self.assemble_config,
            'up_to_date': self.up_to_date,
        })
