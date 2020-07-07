echo off
set SMB_VOL=//1.2.3.4/my/path/to/Deep-Water
set SMB_DOMAIN=my_domain_name
docker stack rm dwf_stack
docker swarm leave --force
set /p SMB_USER="Enter Samba Username: "
set psCommand="powershell -Command $pword = read-host 'Enter Samba Password' -AsSecureString ; $BSTR=[System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($pword); [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)"
for /f "usebackq delims=" %%p in (`%psCommand%`) do set SMB_PASSWD=%%p
docker build -t=dwf-server .
docker tag dwf-server viszkoktamas93/dwf-server
docker volume rm dwf_stack_esdata --force
docker volume rm dwf_stack_sedstorvol --force
docker swarm init
docker stack deploy -c docker-compose.yml dwf_stack
