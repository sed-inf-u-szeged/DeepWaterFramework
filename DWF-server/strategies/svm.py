strategy_type = "learning"
config = {
    "strategy_id": "svm",
    "name": "Support Vector Machine Classifier",
    "parameters": [
        {
            "parameter_id": "C",
            "label": "C - Error term weight",
            "type": "float",
            "default_value": 2.6,
        },
        {
            "parameter_id": "kernel",
            "label": "SVM kernel",
            "selection_values": [
                "linear",
                "poly",
                "sigmoid",
                "rbf",
            ],
            "default_value": "rbf",
        },
        {
            "parameter_id": "degree",
            "label": "Polynom degree",
            "type": "int",
            "visibility_rules": [
                {
                    "field": "kernel",
                    "values": [
                        "poly",
                    ],
                },
            ],
        },
        {
            "parameter_id": "gamma",
            "label": "Kernel coefficient",
            "type": "float",
            "visibility_rules": [
                {
                    "field": "kernel",
                    "values": [
                        "rbf",
                        "poly",
                        "sigmoid",
                    ],
                },
            ],
            "default_value": 0.02,
        },
        {
            "parameter_id": "coef0",
            "label": "Independent term in kernel function",
            "type": "float",
            "visibility_rules": [
                {
                    "field": "kernel",
                    "values": [
                        "poly",
                        "sigmoid",
                    ],
                },
            ],
        },
    ],
    "grid_search": {
        "small": [
            {
                "C": 0.1,
                "kernel": "linear",
            },
            {
                "C": 0.1,
                "kernel": "poly",
                "degree": 2,
            },
            {
                "C": 0.1,
                "kernel": "poly",
                "degree": 3,
            },
            {
                "C": 2.6,
                "kernel": "rbf",
                "gamma": 0.005,
            },
            {
                "C": 0.1,
                "kernel": "sigmoid",
            },
        ],
        "medium": [
            {
                "C": 1.0,
                "kernel": "linear",
            },
            {
                "C": 1.0,
                "kernel": "poly",
                "degree": 2,
            },
            {
                "C": 1.0,
                "kernel": "poly",
                "degree": 3,
            },
            {
                "C": 2.6,
                "kernel": "rbf",
                "gamma": 0.02,
            },
            {
                "C": 1.0,
                "kernel": "sigmoid",
            },
        ],
        "large": [
            {
                "C": 2.0,
                "kernel": "linear",
            },
            {
                "C": 2.0,
                "kernel": "poly",
                "degree": 2,
            },
            {
                "C": 2.0,
                "kernel": "poly",
                "degree": 3,
            },
            {
                "C": 2.6,
                "kernel": "rbf",
                "gamma": 0.5,
            },
            {
                "C": 2.0,
                "kernel": "sigmoid",
            },
        ],
    }
}
