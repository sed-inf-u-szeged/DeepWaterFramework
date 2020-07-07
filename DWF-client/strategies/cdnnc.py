strategy_type = "learning"
config = {
    "strategy_id": "cdnnc",
    "name": "Customized DNN Classifier",
    "parameters": [
        {
            "parameter_id": "layers",
            "label": "Number of layers",
            "type": "int",
            "required": True,
            "default_value": 5,
        },
        {
            "parameter_id": "neurons",
            "label": "Number of neurons per layer",
            "type": "int",
            "required": True,
            "default_value": 250,
        },
        {
            "parameter_id": "batch",
            "label": "Batch size",
            "type": "int",
            "required": True,
            "default_value": 100,
        },
        {
            "parameter_id": "lr",
            "label": "Starting learning rate",
            "type": "float",
            "required": True,
            "default_value": 0.1,
        },
        {
            "parameter_id": "beta",
            "label": "L2 regularization bias",
            "type": "float",
            "default_value": 0.0005,
        },
        {
            "parameter_id": "max-misses",
            "label": "Maximum consecutive misses before early stopping",
            "type": "int",
        },
    ],
    "grid_search": {
        "small": [
            {
                "layers": 2,
                "neurons": 100,
                "batch": 512,
                "lr": 0.025,
            },
            {
                "layers": 3,
                "neurons": 100,
                "batch": 512,
                "lr": 0.05,
            },
            {
                "layers": 4,
                "neurons": 100,
                "batch": 512,
                "lr": 0.1,
            },
            {
                "layers": 5,
                "neurons": 100,
                "batch": 512,
                "lr": 0.2,
            },
        ],
        "medium": [
            {
                "layers": 2,
                "neurons": 200,
                "batch": 512,
                "lr": 0.025,
            },
            {
                "layers": 3,
                "neurons": 200,
                "batch": 512,
                "lr": 0.05,
            },
            {
                "layers": 4,
                "neurons": 200,
                "batch": 512,
                "lr": 0.1,
            },
            {
                "layers": 5,
                "neurons": 200,
                "batch": 512,
                "lr": 0.2,
            },
        ],
        "large": [
            {
                "layers": 2,
                "neurons": 100,
                "batch": 512,
                "lr": 0.025,
            },
            {
                "layers": 3,
                "neurons": 150,
                "batch": 512,
                "lr": 0.05,
            },
            {
                "layers": 4,
                "neurons": 200,
                "batch": 512,
                "lr": 0.1,
            },
            {
                "layers": 5,
                "neurons": 250,
                "batch": 512,
                "lr": 0.2,
            },
            {
                "layers": 6,
                "neurons": 300,
                "batch": 512,
                "lr": 0.3,
            },
            {
                "layers": 7,
                "neurons": 350,
                "batch": 512,
                "lr": 0.4,
            },
        ],
    }
}
