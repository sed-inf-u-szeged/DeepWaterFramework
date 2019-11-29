from . import computeWeights

def embed(args, sargs_str):
    parser = computeWeights.getParser()
    sargs = parser.parse_args(sargs_str.split())
    return computeWeights.computeWeights(sargs)