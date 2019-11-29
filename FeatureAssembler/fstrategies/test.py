import argparse
import fa_util as util
import shutil
import os

parser = argparse.ArgumentParser()
parser.add_argument('--a', type=int, default=10, help='The number of trees in the forest')

def embed(args, sargs_str):
    sargs = util.parse(parser, sargs_str.split())
    res_csv_name = 'dataset.csv'
    shutil.copy(r'\\sedstor.inf.u-szeged.hu\common\team\columbus\projects\kutatas\Deep-Water\test\dataset.csv', os.path.join(args['output'], res_csv_name))
    return os.path.join(args['output'], res_csv_name)