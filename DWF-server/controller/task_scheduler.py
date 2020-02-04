from model import Priority
from controller import task_store as ts


class TaskScheduler:
    def __init__(self):
        self.running_experiments = []
        self.running_immediate_experiments = []

    def get_next(self):
        return self._get_exp_id(self.running_immediate_experiments) or self._get_exp_id(self.running_experiments)

    @staticmethod
    def _get_exp_id(exp_list):
        if not exp_list:
            return None

        res = exp_list[0]
        exp_list.pop(0)
        exp_list.append(res)
        return res

    def add_experiment(self, exp_id, priority):
        if exp_id in self.running_experiments or exp_id in self.running_immediate_experiments:
            return

        if priority < Priority.IMMEDIATE:
            self.running_experiments.append(exp_id)
            for _ in range(0, priority * priority):
                self.running_experiments.insert(0, exp_id)

        else:
            self.running_immediate_experiments.append(exp_id)

    def remove_experiment(self, exp_id):
        if exp_id not in self.running_experiments and exp_id not in self.running_immediate_experiments:
            return

        if exp_id in self.running_immediate_experiments:
            self.running_immediate_experiments.remove(exp_id)

        else:
            while exp_id in self.running_experiments:
                self.running_experiments.remove(exp_id)

    def change_exp_priority(self, exp_id, priority):
        self.remove_experiment(exp_id)
        self.add_experiment(exp_id, priority)

    def check_experiment(self, exp_id, priority):
        exp_has_task = ts.search_task_by_order(exp_id)
        if exp_has_task:
            self.add_experiment(exp_id, priority)

        else:
            self.remove_experiment(exp_id)


scheduler = TaskScheduler()


def init(exp_list):
    for exp_id, exp in exp_list:
        scheduler.check_experiment(exp_id, exp.priority)
