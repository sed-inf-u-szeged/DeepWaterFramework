echo off
set SMB_VOL=
set SMB_DOMAIN=
docker volume inspect dwf_stack_sedstorvol>nul 2>&1
IF %ERRORLEVEL%==0 (
    echo "The dwf_stack_sedstorvol exists, using it."
) ELSE (
    set /p SMB_USER=Enter Samba Username: 

    set psCommand="powershell -Command $pword = read-host 'Enter Samba Password' -AsSecureString ; $BSTR=[System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($pword); [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)"
    
    for /f "usebackq delims=" %%p in (`%psCommand%`) do set SMB_PASSWD=%%p
)
set DWF_INIT_DB=
docker build -t=dwf-server .
docker tag dwf-server viszkoktamas93/dwf-server
docker swarm init
docker stack deploy -c docker-compose.yml dwf_stack
