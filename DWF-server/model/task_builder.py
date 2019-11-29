from controller import assemble_task_store as ats


def assemble_task_json(assemble_task):
    config = assemble_task.assemble_config
    return {
        "type": "feature_assembling",
        "parameters": {
            "strategy": [config['strategy_id'], parameters_to_string(config['strategy_parameters'])],
        }
    }


def learn_task_json(learn_task):
    a_conf = learn_task.assemble_config
    csv = ats.get_task_by_id(learn_task.assemble_task_id).result_file_path
    if not csv:
        return None

    l_conf = learn_task.learn_config
    preprocess = []
    if 'preprocess_features' in l_conf['shared_parameters'] and l_conf['shared_parameters']['preprocess_features'] != "none":
        preprocess.append(["features", l_conf['shared_parameters']['preprocess_features']])

    if 'preprocess_labels' in l_conf['shared_parameters'] and l_conf['shared_parameters']['preprocess_labels'] != "none":
        preprocess.append(["labels", l_conf['shared_parameters']['preprocess_labels']])

    return {
        "type": "learning",
        "parameters": {
            "shared": {
                "csv": csv,
                "label": a_conf['shared_parameters']['label'],
                **{k:v for k, v in l_conf['shared_parameters'].items() if k not in ['preprocess_features', 'preprocess_labels']}
            },
            "strategy": [[l_conf['strategy_id'], parameters_to_string(l_conf['strategy_parameters'])]],
            "preprocess": preprocess,
        }
    }


def parameters_to_string(parameters):
    return ' '.join([f'--{k} {v}' for k, v in parameters.items()])
