strategy_type = "learning"
config = {
    "strategy_id": "forest",
    "name": "Random Forest Classifier",
    "parameters": [
        {
            "parameter_id": "n-estimators",
            "label": "Number of trees in the forest",
            "type": "int",
            "default_value": 100,
        },
        {
            "parameter_id": "max-depth",
            "label": "Max decision tree leaf node depth",
            "type": "int",
            "default_value": 10,
        },
        {
            "parameter_id": "criterion",
            "label": "Split quality criterion",
            "selection_values": [
                "gini",
                "entropy"
            ],
            "default_value": "entropy",
        },
    ],
    "grid_search": {
        "small": [
            {
                "n-estimators": 5,
                "max-depth": 10,
            },
            {
                "n-estimators": 10,
                "max-depth": 10,
            },
            {
                "n-estimators": 20,
                "max-depth": 10,
            },
            {
                "n-estimators": 50,
                "max-depth": 10,
            },
        ],
        "medium": [
            {
                "n-estimators": 5,
                "max-depth": 10,
                "criterion": "entropy",
            },
            {
                "n-estimators": 10,
                "max-depth": 10,
                "criterion": "entropy",
            },
            {
                "n-estimators": 20,
                "max-depth": 10,
                "criterion": "entropy",
            },
            {
                "n-estimators": 50,
                "max-depth": 10,
                "criterion": "entropy",
            },
            {
                "n-estimators": 100,
                "max-depth": 10,
            },
            {
                "n-estimators": 100,
                "max-depth": 10,
                "criterion": "entropy",
            },
        ],
        "large": [
            {
                "n-estimators": 5,
                "max-depth": 5,
            },
            {
                "n-estimators": 10,
                "max-depth": 5,
            },
            {
                "n-estimators": 20,
                "max-depth": 5,
            },
            {
                "n-estimators": 50,
                "max-depth": 5,
            },
            {
                "n-estimators": 5,
                "max-depth": 15,
                "criterion": "entropy",
            },
            {
                "n-estimators": 10,
                "max-depth": 15,
                "criterion": "entropy",
            },
            {
                "n-estimators": 20,
                "max-depth": 15,
                "criterion": "entropy",
            },
            {
                "n-estimators": 50,
                "max-depth": 15,
                "criterion": "entropy",
            },
        ],
    }
}
