strategy_type = "learning"
config = {
    "strategy_id": "knn",
    "name": "K Nearest Neighbors Classifier",
    "parameters": [
        {
            "parameter_id": "n_neighbors",
            "label": "K - number of neighbors",
            "type": "int",
            "default_value": 18,
        },
        {
            "parameter_id": "weights",
            "label": "Weighting method",
            "selection_values": [
                "uniform",
                "distance"
            ]
        },
    ],
    "grid_search": {
        "small": [
            {
                "n_neighbors": 22
            },
            {
                "n_neighbors": 32
            },
            {
                "n_neighbors": 44
            },
            {
                "n_neighbors": 6,
                "weights": "distance"
            },
            {
                "n_neighbors": 12,
                "weights": "distance"
            },
            {
                "n_neighbors": 20,
                "weights": "distance"
            }
        ],
        "medium": [
            {
                "n_neighbors": 26
            },
            {
                "n_neighbors": 38
            },
            {
                "n_neighbors": 16,
                "weights": "distance"
            },
        ],
        "large": [
            {
                "n_neighbors": 24
            },
            {
                "n_neighbors": 28
            },
            {
                "n_neighbors": 30
            },
            {
                "n_neighbors": 34
            },
            {
                "n_neighbors": 36
            },
            {
                "n_neighbors": 40
            },
            {
                "n_neighbors": 42
            },
            {
                "n_neighbors": 8,
                "weights": "distance"
            },
            {
                "n_neighbors": 10,
                "weights": "distance"
            },
            {
                "n_neighbors": 14,
                "weights": "distance"
            },
            {
                "n_neighbors": 18,
                "weights": "distance"
            },
        ],
    }
}
