echo off
set SMB_VOL=//10.6.12.200/common/team/columbus/projects/kutatas/Deep-Water
set SMB_DOMAIN=SEDDOM
docker swarm leave --force
docker stack rm dwf_stack
docker volume rm dwf_stack_sedstorvol
docker volume inspect dwf_stack_sedstorvol>nul 2>&1
set /p SMB_USER=Enter Samba Username:
set psCommand="powershell -Command $pword = read-host 'Enter Samba Password' -AsSecureString ; $BSTR=[System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($pword); [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)"
for /f "usebackq delims=" %%p in (`%psCommand%`) do set SMB_PASSWD=%%p
set DWF_INIT_DB=1
docker build -t=dwf-server .
docker tag dwf-server viszkoktamas93/dwf-server
docker swarm init
docker stack deploy -c docker-compose.yml dwf_stack
