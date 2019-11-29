import csv
import sys
import json

def readDbhCsv(directory, kind):
  filename=directory+"/dbh.csv"
  with open(filename, mode='r', encoding='utf-8' ) as resultFile:
    reader=csv.reader(resultFile, dialect='excel',  delimiter = ";")
    data=list(reader)

  for i in range(len(data)):
    if (kind == data[i][3] or kind == "all"):
    #print (data[i][3])
    #data1 = json.loads(data[i][8].replace('\'','"'))
    #data2 = json.loads(data[i][9].replace('\'','"'))
      data3 = json.loads(data[i][10].replace('\'','"'))
      print ("|" + data[i][3] 
              + "|" + '{:03.2f}'.format(data3["precision"])+ "|" 
              + '{:03.2f}'.format(data3["recall"])
              + "|" + '{:03.2f}'.format(data3["accuracy"])
              + "|" +'{:03.2f}'.format(data3["fmes"]) 
              + "|" + '{:03.2f}'.format(data3["completeness"]) +  "|")

if len(sys.argv) > 2:
   readDbhCsv(sys.argv[1], sys.argv[2])
else:
   print("|Algorithm | Precision | Recall | Accuracy | Fmes | Completness |")
   print("| --------- | --------- | ------ | -------- | ---- | ----------- |")
   readDbhCsv(sys.argv[1], "all")



