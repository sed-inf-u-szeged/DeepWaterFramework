#!/bin/bash
export SMB_VOL=//1.2.3.4/my/path/to/Deep-Water
export SMB_DOMAIN=my_domain_name
read -p "Enter SAMBA Username: " s_usr
read -sp "Enter SAMBA Password: " s_pwd
export SMB_USER=$s_usr
export SMB_PASSWD=$s_pwd
export DWF_INIT_DB=1
docker stack rm dwf_stack
docker build -t=dwf-server .
docker tag dwf-server viszkoktamas93/dwf-server
docker swarm init
sleep 10s
docker stack deploy -c docker-compose.yml dwf_stack
