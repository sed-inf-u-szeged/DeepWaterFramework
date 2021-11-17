from abc import ABC, abstractmethod

class ConfigParams(ABC):
    def __init__(self):
        self.params = {}
        self.shared_params = {}

    @abstractmethod
    def get_name(self):
        pass

    def get_data(self):
        data = {}
        for param_name, param_value in self.params.items():
            data[f"{self.get_name()}_{param_name}"] = param_value

        for param_name, param_value in self.shared_params.items():
            data[param_name] = param_value 

        return data

# Assembler configs ---

class SharedAssemblerParams():
    def __init__(self, label):
        self.data = {}
        self.data['label'] = label

    def get_data(self):
        return self.data



class ManualCSVFile(ConfigParams):
    def __init__(self, label, file_path):
        super().__init__()
        self.name = 'manual_file_input'
        self.params['file_path'] = file_path
    
    def get_name(self):
        return self.name

class TrainTest(ConfigParams):
    def __init__(self, train_path, test_path):
        super().__init__()
        self.name = "train_test_input"
        self.params['train_path'] = train_path
        self.params['test_path'] = test_path


    def get_name(self):
        return self.name

#Learning configs ---

class SharedLearningParams():
    # Possible values from task_details.j2
    def __init__(self, resample_amount = 50, resample = 'up', seed = 1337, preprocess_features = 'standardize', preprocess_labels = 'binarize'):
        self.data = {}
        self.data['resample_amount'] = resample_amount
        self.data['resample'] = resample
        self.data['seed'] = seed
        self.data['preprocess_features'] = preprocess_features
        self.data['preprocess_labels'] = preprocess_labels

    def get_data(self):
        return self.data


class AdaBoost(ConfigParams):
    def __init__(self, n_estimators = 50, learning_rate = 1.0, max_depth = 1, min_samples_leaf = 1):
        super().__init__()
        self.name = "adaboost"
        self.params['n-estimators'] = n_estimators
        self.params['learning-rate'] = learning_rate
        self.params['max-depth'] = max_depth
        self.params['min-samples-leaf'] = min_samples_leaf

    def get_name(self):
        return self.name

class Bayes(ConfigParams):
    def __init__(self):
        super().__init__()
        self.name = "bayes"

    def get_name(self):
        return self.name

class CDNNC(ConfigParams):
    def __init__(self, layers = 5, neurons = 250, batch = 100, lr = 0.1, beta = 0.0005, max_misses = None):
        super().__init__()
        self.name = "cdnnc"
        self.params['layers'] = layers
        self.params['neurons'] = neurons
        self.params['batch'] = batch
        self.params['lr'] = lr
        self.params['beta'] = beta
        if max_misses:
            self.params['max-misses'] = max_misses

    def get_name(self):
        return self.name

class Forest(ConfigParams):
    def __init__(self, n_estimators = 100, max_depth = 10, criterion='entropy'):
        super().__init__()
        self.name = "forest"
        self.params['n-estimators'] = n_estimators
        self.params['max-depth']  = max_depth
        self.params['criterion'] = criterion

    def get_name(self):
        return self.name

class KNN(ConfigParams):
    def __init__(self, n_neighbors = 18, weights = None):
        super().__init__()
        self.name = "knn"
        self.params['n_neighbors'] = n_neighbors
        if weights:
            self.params['weights'] = weights


    def get_name(self):
        return self.name

class Linear(ConfigParams):
    def __init__(self):
        super().__init__()
        self.name = "linear"

    def get_name(self):
        return self.name

class Logistic(ConfigParams):
    def __init__(self, solver = 'liblinear', penalty = "l2", C=2.0, tol=0.0001):
        super().__init__()
        self.name = "logistic"
        self.params['solver'] = solver
        self.params['penalty'] = penalty
        self.params['C'] = C
        self.params['tol'] = tol


    def get_name(self):
        return self.name

class SDNNC(ConfigParams):
    def __init__(self, layers=5, neurons=200, batch=100, epochs=10, lr = 0.05):
        super().__init__()
        self.name = "sdnnc"
        self.params['layers'] = layers
        self.params['neurons'] = neurons
        self.params['batch'] = batch
        self.params['epochs'] = epochs
        self.params['lr'] = lr


    def get_name(self):
        return self.name


class SVM(ConfigParams):
    def __init__(self, C =2.6, kernel="rbf", degree = "", gamma=0.02, coef0 = 0.05):
        super().__init__()
        self.name = "svm"
        self.params['C'] = C
        self.params['kernel'] = kernel
        self.params['degree'] = degree
        self.params['gamma'] = gamma
        self.params['coef0'] = coef0


    def get_name(self):
        return self.name

class Tree(ConfigParams):
    def __init__(self, max_depth = 10, criterion=None):
        super().__init__()
        self.name = "tree"
        self.params['max-depth'] = max_depth
        if criterion:
            self.params['criterion'] = criterion


    def get_name(self):
        return self.name

class ZeroR(ConfigParams):
    def __init__(self):
        super().__init__()
        self.name = "zeror"


    def get_name(self):
        return self.name