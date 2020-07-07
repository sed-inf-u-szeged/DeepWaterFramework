# DWF Client

Requests tasks from the DWF server via HTTP, reporting the progress and the results.
If no task is available, retries again in a preconfigured time (default is 30 sec). 

### Prerequisites
Pip and Python 3.6 is required (tensorflow doesn't support versions >= 3.7).
It is also recommended to use pipenv to avoid package conflicts with other projects on the target machine. 

Install pipenv:

    pip install pipenv

Then:

    pipenv install --ignore-pipfile

Alternatively, you can also use native pip, if a virtualized environment is not needed:

    pip install --trusted-host pypi.python.org -r requirements.txt

### Running the client
If using pipenv:

    pipenv run python dwf_client.py

If usig pip:

    python dwf_client.py

#### Switches
- `--reinit`: Start client with it's state reset (use when server db is wiped).
- `--debug`: Show traceback along with exception messages.
- `--name=NAME`: Set client's name to NAME (this is given by the client user, may not be unique server wise)  

### Configurations
Can be found at subfolder `dwf_client_utils`.
   
- `client_params.json`: Parameters related to learning and embedding models.
- `config.json`: Configurations related to the DWF client-server architecture.

Set these accordingly before running the client.

## Advanced

### Customizing the framework

In the DWF Framework there are two kinds of tasks: 

- **assembling** tasks which produce the input (mostly a a set of feature vectors) for the learning tasks
- **learning** tasks 

Implementing a strategy for assembling or learning tasks is slightly different and currently must be done manually.

#### Implementing a new assembling strategy
Assembling is mainly done by the Feature Assembler which looks for the available strategies in the fstrategies subdirectory. To add a new assemling strategy the following steps must be performed:

1. Implement the strategy as a python module with a callable `embed` with the followig form:
    
        def embed(args, sargs_str):
            # Performing the assemling strategy
            ...
            return csv_path
    `args` represents the arguments provided by the Feature Assembler module  
    `sargs_str` is a string containing the arguments corresponding to the strategy. It follows the argparse module's convention, that is: *"--sarg1 value1 --sarg2 value2 ..."*  
    `csv_path` is the absolute path as string to the CSV containing the assembled features
2. Add the module to the **FeatureAssembler/fstrategies** directory and add the import statement to `__init__.py`. Note that the module's name will also be the strategy's identifier in the DWF.
3. Create the config file for the assembling, which contains the arguments used by the strategy. This is a python file `<strategy_id>.py` and should be placed in **DWF-client/strategies** directory. For more information about config file structure please refer to the already implemented stratgies and the README file.
4. Copy this file to the **DWF-server's strategies** directory (default is DWF-server/strategies), so the server will register the new strategy too.
5. Done!

#### Implementing a new learning strategy
The recommended way to implement a new learning strategy is to do it via the **DeepBugHunter** module (following similar fashion as the scikit learn package):

1. Implement the strategy as a python module with two callables `learn` and `predict`:
    
        def predict(classifier, test, args, sargs_str, threshold=None):
            ...
            return preds

        def learn(train, dev, test, args, sargs_str):
            ...
            return train_result, dev_result, test_result, classifier
        
    `args` represents the arguments provided by the DeepBugHunter module  
    `sargs_str` is a string containing the arguments corresponding to the strategy. It follows the argparse module's convention, that is: *"--sarg1 value1 --sarg2 value2 ..."*  
    The rest is fairly straightforward, for more information please refer to the already implemented strategies.
2. Add the module to the **DeepBugHunter/strategies** directory and add the corresponding import statement to `__init__.py`. Note that the module's name will also be the strategy's identifier in DWF.
3. 3. Done!
