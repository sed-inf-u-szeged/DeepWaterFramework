#!/bin/bash
cd DWF-server
echo starting server
bash ./rebuild_run_and_init.sh
echo creating test environment...
python3 test.py
cd ..
