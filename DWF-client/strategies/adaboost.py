strategy_type = "learning"
config = {
    "strategy_id": "adaboost",
    "name": "AdaBoost Classifier",
    "parameters": [
        {
            "parameter_id": "n-estimators",
            "label": "Maximum number of trees",
            "type": "int",
            "default_value": 50,
        },
        {
            "parameter_id": "learning-rate",
            "label": "Learning rate",
            "type": "float",
            "default_value": 0.5,
        },
        {
            "parameter_id": "max-depth",
            "label": "Max depth of a tree",
            "type": "int",
            "default_value": 1,
        },
        {
            "parameter_id": "min-samples-leaf",
            "label": "Minimum number of samples for a leaf node",
            "type": "int",
            "default_value": 1,
        },
    ],
    "grid_search": {
        "small": [
            {
                "n-estimators": 5,
                "learning-rate": 1,
            },
            {
                "n-estimators": 10,
                "learning-rate": 1,
            },
            {
                "n-estimators": 20,
                "learning-rate": 1,
            },
            {
                "n-estimators": 50,
                "learning-rate": 1,
            },
        ],
        "medium": [
            {
                "n-estimators": 5,
                "learning-rate": 1,
            },
            {
                "n-estimators": 10,
                "learning-rate": 1,
            },
            {
                "n-estimators": 20,
                "learning-rate": 1,
            },
            {
                "n-estimators": 50,
                "learning-rate": 1,
            },
            {
                "n-estimators": 100,
                "learning-rate": 1,
            },
            {
                "n-estimators": 150,
                "learning-rate": 1,
            },
        ],
        "large": [
            {
                "n-estimators": 50,
                "learning-rate": 1,
            },
            {
                "n-estimators": 50,
                "learning-rate": 10,
            },
            {
                "n-estimators": 50,
                "learning-rate": 0.5,
            },
            {
                "n-estimators": 100,
                "learning-rate": 1,
            },
            {
                "n-estimators": 100,
                "learning-rate": 20,
            },
            {
                "n-estimators": 100,
                "learning-rate": 0.2,
            },
        ],
    }
}
