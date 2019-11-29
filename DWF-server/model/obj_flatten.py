import collections


def flatten(obj_dict, key_prefix=''):
    result = []
    for k, v in obj_dict.items():
        key = f'{key_prefix}.{k}' if key_prefix else k
        if isinstance(v, collections.Mapping):
            result.extend(flatten(v, key))

        elif not isinstance(v, list):
            if isinstance(v, str):
                result.append((f"{key}.keyword", v))

            else:
                result.append((key, v))

    return result
