# DWF Strategies
This module contains the configurations for the strategies in the DWF. In this doc the current strategy's identifier will be noted as `<strategy_id>`.  
Each config file is python file of form `<strategy_id>.py`. It is basically a dictionary of `strategy_type` and `config`.
 
 - `strategy_type`: The strategy's type as string, it can be *learning* or *assembler*.
 - `config`: A dictionary containing the details of the strategy, with the following fields:  
    - `strategy_id`: The strategy's identifier (`<strategy_id>`), it is also the name of this config file.
    - `name`: The name that will appear for the strategy on the DWF GUI and other instances.
    - `grid_search`: A list of dictionaries with predefined batches of values.
    - `parameters`: A list of dictionaries containing the strategy arguments. This way each dictionary represents a strategy argument (or parameter).  
    The available fields:
        * `parameter_id`: The identifier of the parameter, which will appear in `sargs_str`
        * `label`: The label which will appear in the GUI for this argument's field
        * `type`: The type of argument. Can be *int, float, string, path*.
        * `default_value`: The default value of this argument
        * `required`: Determines if the argument is optional. Can be *true* or *false*.
        * `selection_values`: A list of possible values for the argument.
        * `visibility_rules`:  A list of dictionaries that represent dependencies for availablity. Useful for arguments that are only available if an other argument (`field`) is used with a certain value or `values`.   
        *For example using SVM the degree argument only makes sense if a polynomial kernel is used.*

For examples please refer to the already implemented strategies.