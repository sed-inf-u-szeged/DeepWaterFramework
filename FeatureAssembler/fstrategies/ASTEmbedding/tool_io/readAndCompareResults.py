import csv
import sys
import json

def readDbhCsv(directory):
  retData = dict()
  filename=directory+"/dbh.csv"
  with open(filename, mode='r', encoding='utf-8' ) as resultFile:
    reader=csv.reader(resultFile, dialect='excel',  delimiter = ";")
    data=list(reader)

    for i in range(len(data)):
        retData[data[i][3]]=json.loads(data[i][10].replace('\'','"'))
  return retData

def compare(ref, data):
    if (data>ref):
        return "**"+'{:03.2f}'.format(data)+"** (+"+'{:2.0f}'.format(100*data-100*ref) +")"
    elif (data<ref):
        return "<u>"+'{:03.2f}'.format(data)+"</u> (-"+'{:2.0f}'.format(100*ref-100*data) +")"

    return '{:03.2f}'.format(data)

def compareData(refData, data):
  for i in data:
      print ("|" + i 
              + "|" + compare(refData[i]["precision"], data[i]["precision"])
              + "|" + compare(refData[i]["recall"], data[i]["recall"])
              + "|" + compare(refData[i]["accuracy"], data[i]["accuracy"])
              + "|" +compare(refData[i]["fmes"], data[i]["fmes"]) 
              + "|" + compare(refData[i]["completeness"], data[i]["completeness"]) +  "|")

if len(sys.argv) > 2:
   refData=readDbhCsv(sys.argv[1])
   data=readDbhCsv(sys.argv[2])

   #print(refData)
   print("|Algorithm | Precision | Recall | Accuracy | Fmes | Completness |")
   print("| --------- | --------- | ------ | -------- | ---- | ----------- |")
   compareData(refData, data)



