echo off
set SMB_VOL=//1.2.3.4/my/path/to/Deep-Water
set SMB_DOMAIN=my_domain_name
set /p SMB_USER=Enter Samba Username:
set psCommand="powershell -Command $pword = read-host 'Enter Samba Password' -AsSecureString ; $BSTR=[System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($pword); [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)"
for /f "usebackq delims=" %%p in (`%psCommand%`) do set SMB_PASSWD=%%p
set DWF_INIT_DB=
docker swarm init
docker stack deploy -c docker-compose.yml dwf_stack
