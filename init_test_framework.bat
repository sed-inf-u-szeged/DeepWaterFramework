@echo off
cd DWF-server
echo starting server
call rebuild_run_and_init.bat
echo creating test environment...
python test.py
cd ..
