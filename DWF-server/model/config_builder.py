import collections
import json
import config as global_conf
import numpy as np
import hashlib
import os

from model.strategy_config import StrategyConfig
from strategies import config as strategies_config


def generate_learn_configs(form_data):
    return _generate_configs(form_data, [
        ("resample", "none", str),
        ("resample_amount", 0, int),
        ("seed", 1337, int),
        ("preprocess_features", "none", str),
        ("preprocess_labels", "none", str),
    ], 'learning_strategies')


def generate_assemble_configs(form_data):
    return _generate_configs(form_data, [("label", "BUG", str)], 'assembler_strategies')


def _generate_configs(form_data, shared_parameter_labels, strategy_type):
    strategy_id = form_data['selected_strategy']
    strategy = [conf for conf in strategies_config[strategy_type] if conf["strategy_id"] == strategy_id][0]
    strategy_config = {param["parameter_id"]: param for param in strategy["parameters"]}
    prefix_str = f'{strategy_id}_'
    parameters_dump = {k[len(prefix_str):]: v for k, v in form_data.items() if k.startswith(prefix_str)}
    if [k for k in ['grid_search_small', 'grid_search_medium', 'grid_search_large'] if k in parameters_dump] and 'grid_search' in strategy:
        strategy_parameters_list = {json.dumps(collections.OrderedDict(sorted(elem.items()))) for elem in strategy['grid_search']['small']}
        if 'grid_search_small' not in parameters_dump:
            strategy_parameters_list.update({json.dumps(collections.OrderedDict(sorted(elem.items()))) for elem in strategy['grid_search']['medium']})

            if 'grid_search_medium' not in parameters_dump:
                strategy_parameters_list.update({json.dumps(collections.OrderedDict(sorted(elem.items()))) for elem in strategy['grid_search']['large']})

        strategy_parameters_list = [json.loads(e) for e in strategy_parameters_list]

    else:
        strategy_parameters, error = _get_parameter_values(parameters_dump, strategy_config)
        if error:
            return None, _error_msg(error)

        strategy_parameters_list = _get_strategy_config_list(strategy_config, strategy_parameters)

    strategy_name = strategy["name"]
    shared_parameters = {l: t(form_data.get(l, d)) for l, d, t in shared_parameter_labels}
    return [
        StrategyConfig(
            strategy_id,
            strategy_name,
            params,
            shared_parameters
        ) for params in strategy_parameters_list
    ], None


def _error_msg(error_obj):
    if not error_obj:
        return None

    label, param_type = error_obj
    if param_type == "path":
        return f"{label} should be a valid path."

    return f"{label} should be {param_type}."


def _distinct_configs(config_list):
    tmp_dict = {str(d): d for d in config_list}
    return [v for _, v in tmp_dict.items()]


def _check_visibility_rules(strategy_config, config):
    return {k: v for k, v in config.items() if _check_visibility_rule(strategy_config, config, k)}


def _check_visibility_rule(strategy_config, config, k):
    if k not in strategy_config:
        return False

    if "visibility_rules" not in strategy_config[k]:
        return True

    result = True
    for rule in strategy_config[k]["visibility_rules"]:
        if rule["field"] not in config:
            continue

        if config[rule["field"]] not in rule["values"]:
            result = False

    return result


def _get_strategy_config_list(strategy_config, strategy_parameters):
    strategy_parameters_list = [{}]
    for key, values in strategy_parameters.items():
        tmp_strategy_parameters_list = []
        for value in values:
            tmp_strategy_parameters_list.extend([{**param, key: value} for param in strategy_parameters_list])

        strategy_parameters_list = tmp_strategy_parameters_list

    return _distinct_configs([_check_visibility_rules(strategy_config, config) for config in strategy_parameters_list])


def _get_parameter_values(parameters_dump, config):
    strategy_parameters = {}
    for k, v in parameters_dump.items():
        if k not in config:
            continue

        try:
            if k.endswith('_from'):
                k = k.rstrip("_from")
                values = []
                if f'{k}_to' in parameters_dump and f'{k}_step' in parameters_dump:
                    if config[k]["type"] == "int":
                        values = list(range(
                            int(v),
                            int(parameters_dump[f'{k}_to']),
                            int(parameters_dump[f'{k}_step'])
                        ))
                        values.append(int(parameters_dump[f'{k}_to']))

                    elif config[k]["type"] == "float":
                        values = list(np.arange(
                            float(v),
                            float(parameters_dump[f'{k}_to']),
                            float(parameters_dump[f'{k}_step'])
                        ).tolist())
                        values.append(float(parameters_dump[f'{k}_to']))

            elif k.endswith(('_to', '_step')):
                continue

            elif '_||_||_' in v:
                values = [val for val in v.split('_||_||_') if val in config[k].get('selection_values', [])]

            else:
                if config[k]["type"] == "int":
                    values = [int(v)]

                elif config[k]["type"] == "float":
                    values = [float(v)]

                elif config[k]["type"] == "select":
                    values = [v] if v in config[k].get("selection_values", []) else []

                elif config[k]["type"] == "path":
                    values = [(v, _file_checksum(v))]

                else:
                    values = [v]

            if not values:
                continue

            elif k in strategy_parameters:
                strategy_parameters[k].extend(values)

            else:
                strategy_parameters[k] = values

        except Exception as e:
            return None, (config[k]["label"], config[k]["type"])

    return strategy_parameters, None


def _file_checksum(rel_path):
    if not rel_path or rel_path == "none":
        return ''

    file_path = global_conf.storage_dir + rel_path
    if not os.path.isfile(file_path):
        return ''

    hash_md5 = hashlib.md5()
    with open(global_conf.storage_dir + rel_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)

    return hash_md5.hexdigest()
