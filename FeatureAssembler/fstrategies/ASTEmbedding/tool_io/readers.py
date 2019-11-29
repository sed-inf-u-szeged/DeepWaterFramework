import csv
from gensim.models.doc2vec import Doc2Vec, TaggedDocument

class ASTStream(object):
    def __init__(self, filename):
        self.filename=filename

    def __iter__(self):
        with open(self.filename, mode='r', encoding='utf-8' ) as resultFile:
            reader=csv.reader(resultFile, dialect='excel')
            for i,line in enumerate(reader):
                td=TaggedDocument(words=line[1:],tags=[line[0]])
                yield td


def readBugs(bugs, bugfile):
    with open(bugfile, mode='r', encoding='utf-8' ) as resultFile:
        reader=csv.reader(resultFile, dialect='excel')
        allBugs=list(reader)

        for i in range(len(allBugs)):
            myset=bugs.get(allBugs[i][1], set())
            myset.add(allBugs[i][2])
            bugs.update({allBugs[i][1]:myset})
    return bugs

def readMetrics(metrics, mheader, metricFile):
    with open(metricFile, mode='r', encoding='utf-8' ) as metricsFile:
        reader=csv.reader(metricsFile, delimiter=',')
        mheader=next(reader)
        metricsList=list(reader)

        for i in range(len(metricsList)):
            metrics[metricsList[i][0]]=metricsList[i][1:]

        return metrics, mheader

