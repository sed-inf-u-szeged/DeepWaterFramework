import argparse
from . import argparse_base

import csv
import os
import pandas as pd
from sklearn.manifold import TSNE
import numpy as np
from gensim.models.doc2vec import Doc2Vec, TaggedDocument
import multiprocessing
import sys
from .tool_io import printWeights as pw
from .tool_io import readers as rd
from . import weightsAlgorithms as algs

modelFileName="model.model"

def getParser():
    parser = argparse.ArgumentParser(parents=[argparse_base.parser], description="AST embeddings calculator")
    parser.add_argument('--astFile', action="store", help="The name of the file which stores the AST information.", required=True)
    parser.add_argument('--bugFile', action="store", help="The name of the file which contains the bug dataset.")
    parser.add_argument('--metricsFile', action="store", help="The name of the file which contains the metrics information.")
    group=parser.add_argument_group('Doc2Vec parameters')
    parser.add_argument('--model', help="The weights will be computed according to the corpus given by the model.")
    group.add_argument('--window_size', type=int, default=10, help="The maximum distance between the current and predicted word within a sentence.")
    group.add_argument('--vector_size', type=int, default=50, help="Dimensionality of the feature vectors.")
    group.add_argument('--max_epochs', type=int, default=10)
    group.add_argument('--dm', default=1, type=int, choices=[0, 1], help="Defines the training algorithm. If dm=1, ‘distributed memory’ (PV-DM) is used. Otherwise, distributed bag of words (PV-DBOW) is employed.")
    group.add_argument('--seed', type=int, default=12345)
    parser.add_argument('--algorithm', type=int, choices=[1, 2], help="Alternative approches for weights computation from the weights of the AST nodes.")

    return parser

def buildModel(arguments, d2v_model, tagged_data):
    global modelFileName
    d2v_model.build_vocab(tagged_data)

    #print (30*'#')
    print("Total words in corpus: {}".format(d2v_model.corpus_total_words))
    print("Total documents in corpus: {}".format(d2v_model.corpus_count))


    d2v_model.train(tagged_data, total_examples=d2v_model.corpus_count, epochs=d2v_model.epochs)
    astName, extension =os.path.splitext(os.path.basename(arguments.astFile))
    modelFileName="A#"+astName+"_DV#v"+str(d2v_model.vector_size)+"w"+str(d2v_model.window)+"e"+str(d2v_model.epochs)+"a"+str(int(d2v_model.dm))
    modelFile=arguments.outputDir+"/"+modelFileName+".model"
    
    print("Saving the model " + modelFileName +" in" + modelFile)
    d2v_model.save(modelFile)

    if (d2v_model.dm):
        wordWeightsFile=arguments.outputDir+"/"+modelFileName+"_weigthsOfWords.csv"
        print("Saving the words\' weights into " + wordWeightsFile)
        pw.printWeightsOfWords(wordWeightsFile, d2v_model)

    return Doc2Vec.load(modelFile)

def getDoc2VecModel(arguments):
    global modelFileName
    if arguments.model and arguments.model != 'none':
        if (os.path.exists(arguments.model)):
            modelFileName, extension=os.path.splitext(os.path.basename(arguments.model))
            print("Model " + modelFileName + " is loaded from " + arguments.model)
            return Doc2Vec.load(arguments.model)
    else:
        cores = multiprocessing.cpu_count()
        if (arguments.seed>1):
            print("Seed value is: " + str(arguments.seed))
            cores=1
        d2v_model = Doc2Vec(vector_size=arguments.vector_size,
                min_alpha=0.00025,
                alpha=0.025,
                min_count=2,
                window=arguments.window_size,
                epochs=arguments.max_epochs,
                dm=arguments.dm,
                workers=cores,
                seed=arguments.seed)
        astName, extension =os.path.splitext(os.path.basename(arguments.astFile))
        print("AST: " + astName)
        if (os.path.exists(arguments.astFile)):
            tagged_data = rd.ASTStream(arguments.astFile)
            return buildModel(arguments, d2v_model, tagged_data)
    return None


def computeWeights(arguments):
    print (arguments.astFile)
    d2v_model=getDoc2VecModel(arguments)
    if (d2v_model == None):
        print ("Something went wrong in model loading/creation")
        return

    filename = modelFileName

    bugs=dict()
    if (arguments.bugFile):
        print ("Reading bug information from "+arguments.bugFile)
        bugs=rd.readBugs(bugs, arguments.bugFile)
        #print(bugs)
        
        bugName, extension =os.path.splitext(os.path.basename(arguments.bugFile))
        filename=filename+"_B#"+bugName

        metrics=dict()
        mheader=list()
        if (arguments.metricsFile):
            print("Reading metrics from " + arguments.metricsFile)
            metricName, extension =os.path.splitext(os.path.basename(arguments.metricsFile))
            filename=filename+"_M#"+metricName
            metrics, mheader=rd.readMetrics(metrics, mheader, arguments.metricsFile)

        if (arguments.algorithm):
            filename=filename+"_ALG#"+str(arguments.algorithm)
            algs.computeWeights(d2v_model, filename, arguments.outputDir, arguments.astFile, bugs, metrics, mheader, arguments.algorithm)
        else:
            pw.printWeights(d2v_model, filename, arguments.outputDir, arguments.astFile, bugs, metrics, mheader)
    
    result_path = os.path.join(arguments.outputDir, filename, "weights.csv")
    return result_path

if __name__=='__main__':
   computeWeights(getParser().parse_args())
   
