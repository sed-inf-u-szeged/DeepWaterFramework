from model.experiment_summary_task import ExperimentSummaryTask


class ExperimentSummary:
    def __init__(self, name, markdown, tasks, created_ts):
        self.name = name
        self.markdown = markdown
        self.tasks = tasks
        self.created_ts = created_ts

    @classmethod
    def from_es_data(cls, exp):
        res = cls(exp['name'], exp['markdown'], {t_id: ExperimentSummaryTask.from_es_data(t) for t_id, t in exp['tasks'].items()}, exp['created_ts'])
        return res

    def update_task(self, task_id, task):
        if task_id in self.tasks:
            self.tasks[task_id] = task

        return {
            "tasks": self.tasks_as_dicts()
        }

    def set_assemble_result(self, task_id, result_file_path):
        if task_id in self.tasks:
            self.tasks[task_id].assemble_result = result_file_path

        return {
            "tasks": self.tasks_as_dicts()
        }

    def set_learn_result(self, task_id, result):
        if task_id in self.tasks:
            self.tasks[task_id].learn_result = result

        return {
            "tasks": self.tasks_as_dicts()
        }

    def tasks_as_dicts(self):
        return {t_id: t.__dict__ for t_id, t in self.tasks.items()}

    def to_dict(self):
        result = self.__dict__
        result['tasks'] = self.tasks_as_dicts()
        return result
