class ExperimentSummaryTask:
    def __init__(self, assemble_config, learn_config, created_ts):
        self.assemble_config = assemble_config
        self.learn_config = learn_config
        self.created_ts = created_ts
        self.assemble_result = None
        self.learn_result = None

    @classmethod
    def from_es_data(cls, task):
        res = cls(
            assemble_config=task['assemble_config'],
            learn_config=task['learn_config'],
            created_ts=task['created_ts'],
        )
        res.assemble_result = task['assemble_result']
        res.learn_result = task['learn_result']
        return res

    def add_assemble_result(self, result_file_path):
        if result_file_path:
            self.assemble_result = result_file_path

        return {
            "assemble_result": self.assemble_result
        }

    def add_learn_result(self, result):
        if result:
            self.learn_result = result

        return {
            "learn_result": self.learn_result
        }
