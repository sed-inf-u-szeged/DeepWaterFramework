#!/bin/bash
cd DWF-client
pip install -r requirements.txt
cd ..
cp -rf DWF-client DWF-client-2
cp -rf DWF-client DWF-client-3
cp -rf DWF-client DWF-client-4
cd DWF-client
python3 dwf_client.py --reinit &
cd ..
cd DWF-client-2
python3 dwf_client.py --reinit &
cd ..
cd DWF-client-3
python3 dwf_client.py --reinit &
cd ..
cd DWF-client-4
python3 dwf_client.py --reinit &
cd ..
