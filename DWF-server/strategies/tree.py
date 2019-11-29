strategy_type = "learning"
config = {
    "strategy_id": "tree",
    "name": "Decision Tree Classifier",
    "parameters": [
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
        },
    ],
    "grid_search": {
        "small": [
            {
                "max-depth": 5,
            },
            {
                "max-depth": 10,
            },
            {
                "max-depth": 20,
            },
            {
                "max-depth": 50,
            },
        ],
        "medium": [
            {
                "max-depth": 5,
                "criterion": "entropy",
            },
            {
                "max-depth": 10,
                "criterion": "entropy",
            },
            {
                "max-depth": 20,
                "criterion": "entropy",
            },
            {
                "max-depth": 50,
                "criterion": "entropy",
            },
        ],
        "large": [
            {
                "max-depth": 3,
            },
            {
                "max-depth": 8,
            },
            {
                "max-depth": 15,
            },
            {
                "max-depth": 100,
            },
            {
                "max-depth": 3,
                "criterion": "entropy",
            },
            {
                "max-depth": 8,
                "criterion": "entropy",
            },
            {
                "max-depth": 15,
                "criterion": "entropy",
            },
            {
                "max-depth": 100,
                "criterion": "entropy",
            },
        ],
    }
}
