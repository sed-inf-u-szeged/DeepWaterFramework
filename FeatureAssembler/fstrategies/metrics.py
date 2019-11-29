import argparse
import fa_util as util
import csv
import shutil
import os

parser = argparse.ArgumentParser()
parser.add_argument('--OSA-base-dir', required=True, help='Base directory of the OSA tool')
parser.add_argument('--variant1', default="v1", help='Sample param1')
parser.add_argument('--variant2', default="v2", help='Sample param2')

def embed(args, sargs_str):
    sargs = util.parse(parser, sargs_str.split())
    csv_reader = csv.reader(open(args['csv'], 'r'), quotechar='"', delimiter=',')
    for row in csv_reader:
        # Analyze source code between row[0]:row[1]:row[2]-row[0]:row[3]:row[4]
        pass
    res_csv_name = 'dataset.csv'[:-4] + '_' + sargs['variant1'] + '_' + sargs['variant2'] + ".csv"
    shutil.copy(r'\\sedstor.inf.u-szeged.hu\common\team\columbus\projects\kutatas\Deep-Water\test\dataset.csv', os.path.join(args['output'], res_csv_name))
    return os.path.join(args['output'], res_csv_name)

