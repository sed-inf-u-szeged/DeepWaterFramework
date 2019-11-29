import os
import importlib
import config as cfg

config = {
    "assembler_strategies": [],
    "learning_strategies": [],
}

f = [f for f in os.listdir(os.path.dirname(__file__)) if '__' not in f]

for fn in f:
    try:
        fileName, file_extension = os.path.splitext(fn)
        moduleName = f'strategies.{fileName}'
        module = importlib.import_module(moduleName)
        config[f'{module.strategy_type}_strategies'].append(module.config)

    except Exception as e:
        if cfg.debug_mode:
            print(e)
