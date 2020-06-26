#!/bin/bash
cd DWF-client
pip install -r requirements.txt
cd ..
cp -rf DWF-client DWF-client-1
cp -rf DWF-client DWF-client-2
cp -rf DWF-client DWF-client-3
cp -rf DWF-client DWF-client-4
cd DWF-client-1
sed -i 's/return default/return default + " - 1"/g' dwf_client_util/util.py
python3 dwf_client.py --reinit &
cd ..
cd DWF-client-2
sed -i 's/return default/return default + " - 2"/g' dwf_client_util/util.py
python3 dwf_client.py --reinit &
cd ..
cd DWF-client-3
sed -i 's/return default/return default + " - 3"/g' dwf_client_util/util.py
python3 dwf_client.py --reinit &
cd ..
cd DWF-client-4
sed -i 's/return default/return default + " - 4"/g' dwf_client_util/util.py
python3 dwf_client.py --reinit &
cd ..
