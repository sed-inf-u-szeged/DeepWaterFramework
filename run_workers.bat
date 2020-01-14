@echo off
cd DWF-client
pip install -r requirements.txt
cd ..
if 	%1.==. (
    cd DWF-client
    start cmd /k "python dwf_client.py --reinit"
    cd ..
) else (
    for /l %%x in (1, 1, %1) do (
        xcopy DWF-client DWF-client-%%x /e /i /q /y > nul
    )
    for /l %%x in (1, 1, %1) do (
        cd DWF-client-%%x
        start cmd /k "python dwf_client.py --reinit"
        cd ..
    )
)
