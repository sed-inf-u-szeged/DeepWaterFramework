from logging import Handler
from json import load
from dwf_client_util.util import get_module
from dwf_client_util.server import send_to_endpoint
import os
import builtins

CONFIG_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'config.json')


# Custom class to send logs to server via http
class LogHandler(Handler):
    def emit(self, record):
        FIELDS = ['message', 'hash', 'progress']
        record = record.__dict__
        log = {}
        for field in FIELDS:
            if field not in record:
                return

            else:
                log[field] = record[field]

        send_to_endpoint("STATUS", log)


# Convert numpy types to native python types
def convert_numpy_types(data):
    CONVERT_TABLE = {
        'int64': 'int',
        'float64': 'float'
    }

    for (key, value) in data.items():
        value_type = value.__class__.__name__
        if value_type not in CONVERT_TABLE:
            continue

        converter = getattr(builtins, CONVERT_TABLE[value_type])
        data[key] = converter(value)


def get_versions():
    with open(CONFIG_PATH) as config_file:
        config = load(config_file)

    data = []
    for module in config['VERSIONING']:
        data.append({module['NAME']: get_module(module['PATH'], module['NAME']).__version__})

    return data


def pack_results(train, dev, test):
    convert_numpy_types(train)
    convert_numpy_types(dev)
    convert_numpy_types(test)
    return {'train': train, 'dev': dev, 'test': test}


def report_result(result, client_id):
    data = {}
    data['hash'] = client_id
    data['result'] = result
    data['versions'] = get_versions()

    print(data)

    send_to_endpoint('RESULT', data)
