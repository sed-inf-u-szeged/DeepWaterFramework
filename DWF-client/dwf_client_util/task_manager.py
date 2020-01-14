from dwf_client_util.util import merge_params, load_cparams, load_config, prepend_prefix, get_module

config = load_config()


def calc_features(args):
    cparams = load_cparams()['calc_features']
    params = merge_params(cparams, args)

    get_module(config['FA_PATH'], 'fa').main(params)


def is_sarg_path(strategy_name, sarg_name):
    strategy = get_module(config['STRATEGIES_PATH'], strategy_name)
    sarg = next(sarg_param for sarg_param in strategy.config['parameters'] if sarg_param['parameter_id'] == sarg_name)
    if 'type' in sarg and sarg['type'] == 'path':
        return True

    return False


def fix_paths(strategy_name, args):
    sargs = (arg.strip() for arg in args.split('--'))

    fixed_sargs = ''
    for sarg in sargs:
        if sarg and len(sarg.split(' ')) == 2:
            sarg_name, sarg_value = sarg.split(' ')
            if is_sarg_path(strategy_name, sarg_name) and sarg_value != "none":
                sarg_value = prepend_prefix(sarg_value)

            fixed_sargs += f'--{sarg_name} {sarg_value} '

    fixed_sargs = fixed_sargs.strip()
    return fixed_sargs


def learn(args):
    cparams = load_cparams()['DBH']

    params = {**args['shared'], **merge_params(cparams, args)}
    params['preprocess'] = args['preprocess']
    params['csv'] = prepend_prefix(params['csv'])

    get_module(config['DBH_PATH'], 'dbh').main(params)


def process_task(task):
    if task['type'] == 'learning':
        current_strategy = task['parameters']['strategy'][0]
        task['parameters']['strategy'][0][1] = fix_paths(current_strategy[0], current_strategy[1])

    else:
        current_strategy = task['parameters']['strategy']
        task['parameters']['strategy'][1] = fix_paths(current_strategy[0], current_strategy[1])

    if task['type'] == 'feature_assembling':
        calc_features(task['parameters'])

    if task['type'] == 'learning':
        learn(task['parameters'])
