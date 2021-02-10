strategy_type = "assembler"
config = {
    "strategy_id": "ASTEmbedding",
    "name": "Java AST embedding",
    "parameters": [
        {
            "parameter_id": "outputDir",
            "label": "Output Directory",
            "type": "path",
            "required": True
        },
        {
            "parameter_id": "astFile",
            "label": "AST file path",
            "type": "path",
            "required": True
        },
        {
            "parameter_id": "bugFile",
            "label": "Bug file path",
            "type": "path"
        },
        {
            "parameter_id": "metricsFile",
            "label": "Metrics file path",
            "type": "path"
        },
        {
            "parameter_id": "model",
            "label": "Model path",
            "type": "path",
            "default_value": "none"
        },
        {
            "parameter_id": "window_size",
            "label": "Windows size",
            "type": "int",
            "default_value": 10,
            "visibility_rules": [
                {
                    "field": "model",
                    "values": [
                        "none"
                    ]
                }
            ]
        },
        {
            "parameter_id": "vector_size",
            "label": "Vector Size",
            "type": "int",
            "default_value": 50,
            "visibility_rules": [
                {
                    "field": "model",
                    "values": [
                        "none"
                    ]
                }
            ]
        },
        {
            "parameter_id": "max_epochs",
            "label": "Max epoch number",
            "type": "int",
            "default_value": 1,
            "visibility_rules": [
                {
                    "field": "model",
                    "values": [
                        "none"
                    ]
                }
            ]
        },
        {
            "parameter_id": "dm",
            "label": "DM",
            "type": "int",
            "required": True,
            "selection_values": [
                0,
                1
            ],
            "visibility_rules": [
                {
                    "field": "model",
                    "values": [
                        "none"
                    ]
                }
            ]
        },
        {
            "parameter_id": "seed",
            "label": "Random seed",
            "type": "int",
            "default_value": 12345,
            "visibility_rules": [
                {
                    "field": "model",
                    "values": [
                        "none"
                    ]
                }
            ]
        }
    ]
}
