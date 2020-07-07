strategy_type = "learning"
config = {
    "strategy_id": "logistic",
    "name": "Logistic Regression Classifier",
    "parameters": [
        {
            "parameter_id": "solver",
            "label": "Solver algorithm",
            "selection_values": [
                "newton-cg",
                "lbfgs",
                "liblinear",
                "sag",
                "saga",
            ],
            "default_value": "liblinear",
        },
        {
            "parameter_id": "penalty",
            "label": "Used norm in the penalization",
            "selection_values": [
                "l1",
                "l2",
            ],
            "default_value": "l2",
        },
        {
            "parameter_id": "C",
            "label": "C - inverse of regularization strength",
            "type": "float",
            "default_value": 2.0,
        },
        {
            "parameter_id": "tol",
            "label": "Tolerance for stopping criteria",
            "type": "float",
            "default_value": 0.0001,
        },
    ],
    "grid_search": {
        "small": [
            {
                "solver": "newton-cg",
                "penalty": "l2",
                "C": 5.0,
                "tol": 0.0001,
            },
            {
                "solver": "lbfgs",
                "penalty": "l2",
                "C": 5.0,
                "tol": 0.0001,
            },
            {
                "solver": "liblinear",
                "penalty": "l2",
                "C": 5.0,
                "tol": 0.0001,
            },
            {
                "solver": "liblinear",
                "penalty": "l1",
                "C": 5.0,
                "tol": 0.0001,
            },
            {
                "solver": "sag",
                "penalty": "l2",
                "C": 5.0,
                "tol": 0.0001,
            },
            {
                "solver": "saga",
                "penalty": "l2",
                "C": 5.0,
                "tol": 0.0001,
            },
            {
                "solver": "saga",
                "penalty": "l1",
                "C": 5.0,
                "tol": 0.0001,
            },
        ],
        "medium": [
            {
                "solver": "newton-cg",
                "penalty": "l2",
                "C": 1.0,
                "tol": 0.0001,
            },
            {
                "solver": "lbfgs",
                "penalty": "l2",
                "C": 1.0,
                "tol": 0.0001,
            },
            {
                "solver": "liblinear",
                "penalty": "l2",
                "C": 1.0,
                "tol": 0.0001,
            },
            {
                "solver": "liblinear",
                "penalty": "l1",
                "C": 1.0,
                "tol": 0.0001,
            },
            {
                "solver": "sag",
                "penalty": "l2",
                "C": 1.0,
                "tol": 0.0001,
            },
            {
                "solver": "saga",
                "penalty": "l2",
                "C": 1.0,
                "tol": 0.0001,
            },
            {
                "solver": "saga",
                "penalty": "l1",
                "C": 1.0,
                "tol": 0.0001,
            },
        ],
        "large": [
            {
                "solver": "newton-cg",
                "penalty": "l2",
                "C": 0.1,
                "tol": 0.0001,
            },
            {
                "solver": "lbfgs",
                "penalty": "l2",
                "C": 0.1,
                "tol": 0.0001,
            },
            {
                "solver": "liblinear",
                "penalty": "l2",
                "C": 0.1,
                "tol": 0.0001,
            },
            {
                "solver": "liblinear",
                "penalty": "l1",
                "C": 0.1,
                "tol": 0.0001,
            },
            {
                "solver": "sag",
                "penalty": "l2",
                "C": 0.1,
                "tol": 0.0001,
            },
            {
                "solver": "saga",
                "penalty": "l2",
                "C": 0.1,
                "tol": 0.0001,
            },
            {
                "solver": "saga",
                "penalty": "l1",
                "C": 0.1,
                "tol": 0.0001,
            },
        ],
    }
}
