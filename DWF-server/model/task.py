from common import timestamp_ms
from model.priority import Priority
from model.obj_flatten import flatten


class Task:
    def __init__(self, experiment_id, assemble_task_id, learn_task_id, priority=Priority.NORMAL, order_in_exp=0):
        self.experiment_id = experiment_id
        self.assemble_task_id = assemble_task_id
        self.learn_task_id = learn_task_id
        self.priority = priority
        self.order_in_exp = order_in_exp
        self.created_ts = timestamp_ms()
        # state values: "generated", "running", "completed"
        self.state = "generated"
        self.completed_ts = None

    @classmethod
    def from_es_data(cls, task):
        res = cls(
            experiment_id=task['experiment_id'],
            assemble_task_id=task['assemble_task_id'],
            learn_task_id=task['learn_task_id'],
            priority=task['priority'],
            order_in_exp=task['order_in_exp'],
        )
        res.created_ts = task['created_ts']
        res.state = task['state']
        res.completed_ts = task['completed_ts']
        return res

    def stop(self):
        self.state = "generated"
        self.completed_ts = None
        return {
            'state': self.state,
            'completed_ts': self.completed_ts,
        }

    def re_run(self, assemble_task_id, learn_task_id):
        self.assemble_task_id = assemble_task_id
        self.learn_task_id = learn_task_id
        self.created_ts = timestamp_ms()
        self.state = "running"
        self.completed_ts = None
        return {
            'assemble_task_id': self.assemble_task_id,
            'learn_task_id': self.learn_task_id,
            'created_ts': self.created_ts,
            'state': self.state,
            'completed_ts': self.completed_ts,
        }

    def make_runnable(self):
        if self.state == "generated":
            self.state = "running"

        return {
            'state': self.state,
        }

    def is_completed(self):
        return self.state == "completed"

    def completed(self, task_id):
        if task_id == self.learn_task_id or (task_id == self.assemble_task_id and not self.learn_task_id):
            self.completed_ts = timestamp_ms()
            self.state = "completed"

        return {
            'completed_ts': self.completed_ts,
            'state': self.state,
        }

    def set_priority(self, priority):
        self.priority = priority
        return {'priority': self.priority}

    def set_order_in_exp(self, order_in_exp):
        self.order_in_exp = order_in_exp
        return {'order_in_exp': self.order_in_exp}

    def flatten(self):
        return flatten({
            'experiment_id': self.experiment_id,
            'assemble_task_id': self.assemble_task_id,
            'learn_task_id': self.learn_task_id,
        })
