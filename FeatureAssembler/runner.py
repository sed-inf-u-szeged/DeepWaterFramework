import os
import sys
import copy
import subprocess

import fa

shared = {
    'csv': 'sample.csv',
    'clean': False,
    'output': os.path.abspath('output'),
    'lang': 'java',
    'label': 'BUG'
}

strategy_steps = [
    #['astnn', '--a 42 --b 33 --c aa'],
    #['test', '--a 33'],
    #['metrics', '--OSA-base-dir aaa'],
    #['metrics', '--OSA-base-dir aaa --variant1 v11'],
    #['metrics', '--OSA-base-dir aaa --variant1 v11 --variant2 v22']
    #['astnn+metrics+test', ['--a 42 --b 33 --c aa', '--OSA-base-dir aaa --variant1 v11 --variant2 v22', '']]
    'ASTEmbedding', r'--astFile \\sedstor.inf.u-szeged.hu\common\team\columbus\projects\kutatas\Deep-Water\input\ast.csv ' 
                     r'--bugFile \\sedstor.inf.u-szeged.hu\common\team\columbus\projects\kutatas\Deep-Water\input\bugs.csv '
                     r'--metricsFile \\sedstor.inf.u-szeged.hu\common\team\columbus\projects\kutatas\Deep-Water\input\metrics.csv '
                     r'--outputDir \\sedstor.inf.u-szeged.hu\common\team\columbus\projects\kutatas\Deep-Water\test\output '
                     '--window_size 11 --vector_size 51 --max_epochs 1 --dm 1 --seed 12345'
]

def main():
    params = copy.deepcopy(shared)
    params['strategy'] = strategy_steps
    fa.main(params)

if __name__ == '__main__':
    main()