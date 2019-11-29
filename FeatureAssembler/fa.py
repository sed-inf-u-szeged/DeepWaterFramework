import os
import sys
import logging
import argparse
from elasticsearch import Elasticsearch

import fa_util as util
import fstrategies

def _pair(arg):
    return [x for x in arg.split(':')]
    
# command line args
parser = argparse.ArgumentParser()
parser.add_argument('--csv', required=True, help='csv to read the data from')
parser.add_argument('--strategy', required=True, type=_pair, nargs='+', help='how to calculate embeddings, given in STRATEGY:"params to the strategy" pairs')
parser.add_argument('--output', default=os.path.abspath('output'), help='output dir to write embeddings and logs to')
parser.add_argument('--clean', default=False, help='clean output dir before starting?', action='store_true')
parser.add_argument('--lang', choices=['java', 'js', 'python'], default='java', help='source code language')
    
def main(args):
    
    # Create output folder
    util.mkdir(args['output'], args['clean'])
    
    dwf_logging = None
    
    # Logging
    logger = logging.getLogger('FeatureAssembler')
    
    if 'dwf_client_info' in args:
        client_info = args['dwf_client_info']
        sys.path.insert(0, client_info['util_path'])
        dwf_logging = __import__('dwf_logging')
        
    if not logger.handlers:
        formatter = logging.Formatter(fmt='%(asctime)s %(levelname)-8s %(message)s',
                                      datefmt='%Y-%m-%d %H:%M:%S')
        logger.setLevel(logging.DEBUG)
        fh = logging.FileHandler(os.path.join(args['output'], 'dwf.log'), mode='a')
        fh.setLevel(logging.DEBUG)
        fh.setFormatter(formatter)
        logger.addHandler(fh)
        if 'dwf_client_info' in args:
            http_handler = dwf_logging.LogHandler()
            http_handler.setLevel(logging.INFO)
            logger.addHandler(http_handler)
        else:
            ch = logging.StreamHandler()
            ch.setLevel(logging.INFO)
            ch.setFormatter(formatter)
            logger.addHandler(ch)        

    logger.info('FeatureAssembler started...')
    
    
    strategy = args['strategy'][0]
    sargs = args['strategy'][1]
    logger.info(sargs)
    try:
        # Learn the embeddings
        feature_vector_strategy = util.get_strategy(strategy)
        result_path = feature_vector_strategy.embed(args, sargs)
        
        if dwf_logging is not None:
            result_path = __import__('util').strip_prefix(result_path)
            dwf_logging.report_result(result_path, client_info['client_id'])
        
    
    except AttributeError as e:
        print(e)
        logger.error("Can't find strategy: '%s'." % strategy)
        sys.exit(-1)

if __name__ == '__main__':
    main(util.parse(parser, sys.argv[1:]))