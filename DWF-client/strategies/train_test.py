strategy_type = "assembler"
config = {
    "strategy_id": "train_test_input",
    "name": "Train-test Input",
    "parameters": [
        {
            "parameter_id": "train_path",
            "label": "Train file path",
            "type": "path",
            "required": True,
        },
        {
            "parameter_id": "test_path",
            "label": "Test file path",
            "type": "path",
            "required": True,
        },
    ],
}