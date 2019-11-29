from .tool_io import printWeights as pw
import numpy as np

def computeAverage(model, ast):
    #print("computing ASTs' weights with the average weights of their words")
    words=model.wv.index2word 
    #words=d2v_model.wv.index2word
    #print(words)
    size=len(model.wv.get_vector(words[0])) 
    myarray=np.zeros(size)
    for i in range(len(ast)):
        w=model.wv.get_vector(ast[i])
        myarray=myarray+w
    
    myarray=myarray/len(ast)
    return myarray

def computeAverageWithBest10(model, ast):
    #print("computing ASTs' weights with the average weights of their words")
    words=model.wv.index2word
    #words=d2v_model.wv.index2word
    #print(words)
    size=len(model.wv.get_vector(words[0]))
    myarray=np.zeros(size)
    counter=0
    for i in range(len(ast)):
        if ((ast[i] in words[:10]) == False):
            continue
        w=model.wv.get_vector(ast[i])
        myarray=myarray+w
        counter=counter+1
    myarray=myarray/counter
    return myarray

def computeWeights(d2v_model, filename, outputDir, astFile, bugs, metrics, mheader, kind):
    print("Computing weights with alternative methods")
    if (kind == 1):
        pw.printWeights(d2v_model, filename, outputDir, astFile, bugs, metrics, mheader, computeAverage)
    elif (kind==2):
        pw.printWeights(d2v_model, filename, outputDir, astFile, bugs, metrics, mheader, computeAverageWithBest10)

