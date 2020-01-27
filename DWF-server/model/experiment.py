from common import timestamp_ms
from model import Priority


class Experiment:
    def __init__(self, name, markdown, priority=Priority.NORMAL):
        self.name = name
        self.markdown = markdown
        self.priority = priority
        # state is "configuration", "generating_tasks" or "generated_tasks"
        self.state = "configuration"
        self.assemble_configs = []
        self.learn_configs = []
        self.tasks = []
        self.created_ts = timestamp_ms()

    @classmethod
    def from_es_data(cls, exp):
        res = cls(exp['name'], exp['markdown'], exp['priority'])
        res.state = exp['state']
        res.assemble_configs = exp['assemble_configs']
        res.learn_configs = exp['learn_configs']
        res.tasks = exp['tasks']
        res.created_ts = exp['created_ts']
        return res

    def edit_experiment(self, name, markdown, priority=Priority.NORMAL):
        self.name = name
        self.markdown = markdown
        self.priority = priority
        return {
            'name': self.name,
            'markdown': self.markdown,
            'priority': self.priority,
        }

    def copy_configs_from_experiment(self, from_exp):
        self.assemble_configs = from_exp.assemble_configs
        self.learn_configs = from_exp.learn_configs
        return {
            'assemble_configs': self.assemble_configs,
            'learn_configs': self.learn_configs,
        }

    def set_state(self, state):
        self.state = state
        return {
            'state': self.state
        }

    def remove_config(self, config_id):
        try:
            self.assemble_configs.remove(config_id)
            return {
                'assemble_configs': self.assemble_configs,
            }

        except:
            try:
                self.learn_configs.remove(config_id)
                return {
                    'learn_configs': self.learn_configs,
                }

            except:
                return None

    def add_list(self, dest_list, input_list, dest_list_name):
        change = {}
        for input_dict in input_list:
            change.update(self.add_item(dest_list, input_dict, dest_list_name))

        return change

    def add_assemble_config_list(self, config_list):
        return self.add_list(self.assemble_configs, config_list, 'assemble_configs')

    def add_learn_config_list(self, config_list):
        return self.add_list(self.learn_configs, config_list, 'learn_configs')

    def add_task_list(self, task_list):
        return self.add_list(self.tasks, task_list, 'tasks')

    @staticmethod
    def add_item(dest_list, input_item, dest_list_name):
        if input_item and input_item not in dest_list:
            dest_list.append(input_item)

        return {
            dest_list_name: dest_list,
        }

    def add_assemble_config(self, config):
        return self.add_item(self.assemble_configs, config, 'assemble_configs')

    def add_learn_config(self, config):
        return self.add_item(self.learn_configs, config, 'learn_configs')

    def add_task(self, task):
        return self.add_item(self.tasks, task, 'tasks')
