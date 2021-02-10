from . import computeWeights

def embed(args, sargs_str):
    if sargs_str[-2:] == ".0":
        sargs_str = sargs_str[:-2]
    parser = computeWeights.getParser()
    sargs = parser.parse_args(sargs_str.split())
    return computeWeights.computeWeights(sargs)