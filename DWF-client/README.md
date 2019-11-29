# DWF Client

Requests tasks from the DWF server via HTTP, reporting the progress and the results.
If no task is available, retries again in a preconfigured time (default is 30 sec). 

### Prerequisites
Python3 and pip must be installed. Then:

    pip install --trusted-host pypi.python.org -r requirements.txt

### Running the client
    ./python dwf_client.py
#### Switches
- `--reinit`: Start client with it's state reset (use when server db is wiped).

### Configurations
Can be found at subfolder `dwf_client_utils`.
   
- `client_params.json`: Parameters related to learning and embedding models.
- `config.json`: Configurations related to the DWF client-server architecture.

Set these accordingly before running the client.

### API call examples
#### /ping
    { 
        "hash": "",
        "platform_info": { 
            "node": "DESKTOP-J831RTP",
            "os": "Windows-10-10.0.18362-SP0",
            "cpu": { 
                "brand": "AMD Ryzen 5 2400G with Radeon Vega Graphics",
                "clock_speed": "3.6000 GHz",
                "cores": 8
            },
            "gpu_json_str": "[Couldn't retrieve GPU information - probably not nvidia card.]",
            "memory": "30G"
        }
    }
####  /status
    {
        "message": "Fold 1/10 done",
        "hash": "bOftG20BU3xwxO2tLg8t",
        "progress": 0.1
    }

####  /error
    {
        "hash": "bOftG20BU3xwxO2tLg8t",
        "log": "Error message"
    }

#### /result

    {
        "hash": "XlpETW4B7wyobMZLX0WW",
        "result": {
            "train": {
                "tp": 8630,
                "tn": 310381,
                "fp": 4201,
                "fn": 62480,
                "accuracy": 0.8271133443265396,
                "precision": 0.6725898215254675,
                "recall": 0.12136127126984653,
                "fmes": 0.20562061188932876,
                "mcc": 0.23355040005821262,
                "std_dev": [
                    66.73829485385434,
                    57.21442125897979,
                    56.95691353997336,
                    66.73829485385434,
                    0.0008108761389481534,
                    0.015839200519184804,
                    0.009385219357862537,
                    0.01305469135937522,
                    0.00787647442770864
                ]
            },
            "dev": {
                similar to train
            },
            "test": {
                similar to train
            }
        },
        "versions": [
            {
            "sklearn": "0.21.3"
            },
            {
            "tensorflow": "2.0.0"
            },
            {
            "dwf_client": "1.0.0-beta"
            }
        ]
    }