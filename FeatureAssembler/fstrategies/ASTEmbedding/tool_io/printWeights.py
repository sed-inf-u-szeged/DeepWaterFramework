import os
import numpy as np
from gensim.models.doc2vec import Doc2Vec, TaggedDocument
import csv

def infer(model, ast):
    return model.infer_vector(ast)


def printWeights(model, name, baseDir, astFile, bugs, metrics, mheader, compute=infer):
    print(name)
    size=model.vector_size;
    printWithMetrics=len(mheader)>0

    try:
        os.mkdir(baseDir+"/"+name)
    except OSError as error:
        print ("The directory " + baseDir+"/"+name + " is already exist" )
    wfile=open(baseDir+"/"+name+"/weights.csv", "w")

    #Printing the header line
    wfile.write("bug")
    for i in range(size):
      wfile.write(","+"w"+str(i))
    for j in range(len(mheader)-1):
        wfile.write("," + mheader[j+1])
    wfile.write("\n")

    with open(astFile, mode='r', encoding='utf-8' ) as resultFile:
        reader=csv.reader(resultFile, dialect='excel')
        for i,line in enumerate(reader):
            name=line[0]
            ast=line[1:]

            myset=bugs.get(name, None)
            if (myset != None):
                w = compute(model, ast)
                for j in myset:
                   wfile.write(j)
                   wfile.write(',')

                   wfile.write (','.join(map(str, w)))
                   if (printWithMetrics):
                       wfile.write(',')
                       wfile.write(','.join(map(str, metrics[name])))

                   wfile.write("\n")

    wfile.close()

def printWeightsOfWords(filename, model):
    words=model.wv.index2word
    labelStr = {
            "-2":"aux", 
            "0":"ndkBase", 
            "1":"ndkBlockComment", 
            "2":"ndkComment", 
            "3":"ndkCommentable", 
            "4":"ndkJavadocComment", 
            "5":"ndkLineComment", 
            "6":"ndkNamed", 
            "7":"ndkNonJavadocComment", 
            "8":"ndkPositioned", 
            "9":"ndkPositionedWithoutComment", 
            "10":"ndkAnnotation", 
            "11":"ndkArrayAccess", 
            "12":"ndkArrayTypeExpression", 
            "13":"ndkAssignment", 
            "14":"ndkBinary", 
            "15":"ndkBooleanLiteral", 
            "16":"ndkCharacterLiteral", 
            "17":"ndkClassLiteral", 
            "18":"ndkConditional", 
            "19":"ndkDoubleLiteral", 
            "20":"ndkErroneous", 
            "21":"ndkErroneousTypeExpression", 
            "22":"ndkExpression", 
            "23":"ndkExternalTypeExpression", 
            "24":"ndkFieldAccess", 
            "25":"ndkFloatLiteral", 
            "26":"ndkIdentifier", 
            "27":"ndkInfixExpression", 
            "28":"ndkInstanceOf", 
            "29":"ndkIntegerLiteral", 
            "30":"ndkLiteral", 
            "31":"ndkLongLiteral", 
            "32":"ndkMarkerAnnotation", 
            "33":"ndkMethodInvocation", 
            "34":"ndkNewArray", 
            "35":"ndkNewClass", 
            "36":"ndkNormalAnnotation", 
            "37":"ndkNullLiteral", 
            "38":"ndkNumberLiteral", 
            "39":"ndkParenthesizedExpression", 
            "40":"ndkPostfixExpression", 
            "41":"ndkPrefixExpression", 
            "42":"ndkPrimitiveTypeExpression", 
            "43":"ndkQualifiedTypeExpression", 
            "44":"ndkSimpleTypeExpression", 
            "45":"ndkSingleElementAnnotation", 
            "46":"ndkStringLiteral", 
            "47":"ndkSuper", 
            "48":"ndkThis", 
            "49":"ndkTypeApplyExpression", 
            "50":"ndkTypeCast", 
            "51":"ndkTypeExpression", 
            "52":"ndkTypeUnionExpression", 
            "53":"ndkUnary", 
            "54":"ndkWildcardExpression", 
            "55":"ndkAssert", 
            "56":"ndkBasicFor", 
            "57":"ndkBlock", 
            "58":"ndkBreak", 
            "59":"ndkCase", 
            "60":"ndkContinue", 
            "61":"ndkDefault", 
            "62":"ndkDo", 
            "63":"ndkEmpty", 
            "64":"ndkEnhancedFor", 
            "65":"ndkExpressionStatement", 
            "66":"ndkFor", 
            "67":"ndkHandler", 
            "68":"ndkIf", 
            "69":"ndkIteration", 
            "70":"ndkJump", 
            "71":"ndkLabeledStatement", 
            "72":"ndkReturn", 
            "73":"ndkSelection", 
            "74":"ndkStatement", 
            "75":"ndkSwitch", 
            "76":"ndkSwitchLabel", 
            "77":"ndkSynchronized", 
            "78":"ndkThrow", 
            "79":"ndkTry", 
            "80":"ndkWhile", 
            "81":"ndkAnnotatedElement", 
            "82":"ndkAnnotationType", 
            "83":"ndkAnnotationTypeElement", 
            "84":"ndkAnonymousClass", 
            "85":"ndkClass", 
            "86":"ndkClassDeclaration", 
            "87":"ndkClassGeneric", 
            "88":"ndkCompilationUnit", 
            "89":"ndkDeclaration", 
            "90":"ndkEnum", 
            "91":"ndkEnumConstant", 
            "92":"ndkGenericDeclaration", 
            "93":"ndkImport", 
            "94":"ndkInitializerBlock", 
            "95":"ndkInstanceInitializerBlock", 
            "96":"ndkInterface", 
            "97":"ndkInterfaceDeclaration", 
            "98":"ndkInterfaceGeneric", 
            "99":"ndkMember", 
            "100":"ndkMethod", 
            "101":"ndkMethodDeclaration", 
            "102":"ndkMethodGeneric", 
            "103":"ndkNamedDeclaration", 
            "104":"ndkNormalMethod", 
            "105":"ndkPackage", 
            "106":"ndkPackageDeclaration", 
            "107":"ndkParameter", 
            "108":"ndkScope", 
            "109":"ndkStaticInitializerBlock", 
            "110":"ndkTypeDeclaration", 
            "111":"ndkTypeParameter", 
            "112":"ndkVariable", 
            "113":"ndkVariableDeclaration", 
            "114":"ndkArrayType", 
            "115":"ndkBooleanType", 
            "116":"ndkBoundedWildcardType", 
            "117":"ndkByteType", 
            "118":"ndkCharType", 
            "119":"ndkClassType", 
            "120":"ndkDoubleType", 
            "121":"ndkErrorType", 
            "122":"ndkFloatType", 
            "123":"ndkIntType", 
            "124":"ndkLongType", 
            "125":"ndkLowerBoundedWildcardType", 
            "126":"ndkMethodType", 
            "127":"ndkNoType", 
            "128":"ndkNullType", 
            "129":"ndkPackageType", 
            "130":"ndkParameterizedType", 
            "131":"ndkPrimitiveType", 
            "132":"ndkScopedType", 
            "133":"ndkShortType", 
            "134":"ndkType", 
            "135":"ndkTypeVariable", 
            "136":"ndkUnboundedWildcardType", 
            "137":"ndkUnionType", 
            "138":"ndkUpperBoundedWildcardType", 
            "139":"ndkVoidType", 
            "140":"ndkWildcardType"}
    wfile = open(filename,"w") 
    for w in words:
        name=w
        if (w in labelStr):
            name=labelStr[w]
        wfile.write (name + "," + ','.join(map(str, model.wv.get_vector(w))) + "\n")
    wfile.close()

