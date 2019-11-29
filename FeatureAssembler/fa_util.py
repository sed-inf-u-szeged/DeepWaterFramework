import os
import shutil
import copy
import datetime

import fstrategies

def parse(parser, args):
    return dict(vars(parser.parse_args(args)))
    
def _parse_wrapper(feature_vector_strategy, sargs):
    if not isinstance(feature_vector_strategy, fstrategies.combined.FeatureMerger):
        res_dict = dict()
        res_dict[feature_vector_strategy.__name__] = parse(feature_vector_strategy.parser, sargs.split())
        return res_dict
    else:
        combined_dict = dict()
        for strategy, sargs_str in zip(feature_vector_strategy.get_strategies(sargs), sargs):
            combined_dict[strategy.__name__] = parse(strategy.parser, sargs_str.split())
        return combined_dict
    
def mkdir(dir_name, clean=False):
    if clean:
        try:
            shutil.rmtree(dir_name)
        except OSError as e:
            print('Could not remove dir: ' + dir_name)
            raise
    try:
        os.makedirs(dir_name)
    except OSError as e:
        print('Could not create dir: ' + dir_name)
        
def create_doc(args, strategy, sargs, embed_csv):
    doc_json = dict()
    feature_vector_strategy = get_strategy(strategy)
    params = copy.deepcopy(args)
    del params['strategy']
    sargs = _parse_wrapper(feature_vector_strategy, sargs)
    all_args_str = ""
    for alg in sargs.keys():
        print(sargs[alg])
        args_str = " ".join(["--" + arg + " " + str(val) for arg, val in sargs[alg].items()])
        sargs[alg]['cmd_line'] = args_str
        all_args_str += args_str + "/"
    sargs['cmd_line'] = all_args_str[:-1]
    doc_json = {
        'timestamp': datetime.datetime.now(),
        'common_args': params,
        'strategy': strategy,
        'strategy_args': sargs,
        'feature_csv': embed_csv
    }
    return doc_json

def get_strategy(strategy):
    if '+' not in strategy:
        return getattr(fstrategies, strategy)
    else:
        return fstrategies.combined.FeatureMerger(strategy)