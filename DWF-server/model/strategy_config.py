from common import timestamp_ms
from model.obj_flatten import flatten


class StrategyConfig:
    def __init__(self, strategy_id, strategy_name, strategy_parameters, shared_parameters):
        self.strategy_id = strategy_id
        self.strategy_name = strategy_name
        self.strategy_parameters = strategy_parameters
        self.shared_parameters = shared_parameters
        self.created = timestamp_ms()

    @classmethod
    def from_es_data(cls, task):
        res = cls(
            strategy_id=task['strategy_id'],
            strategy_name=task['strategy_name'],
            strategy_parameters=task['strategy_parameters'],
            shared_parameters=task['shared_parameters'],
        )
        res.created = task['created']
        return res

    def flatten(self):
        return flatten(self.to_dict())

    def to_dict(self):
        return {
            'strategy_id': self.strategy_id,
            'strategy_name': self.strategy_name,
            'strategy_parameters': self.strategy_parameters,
            'shared_parameters': self.shared_parameters,
        }
