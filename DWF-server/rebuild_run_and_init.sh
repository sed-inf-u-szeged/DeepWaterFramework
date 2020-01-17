#!/bin/bash
export SMB_VOL=//1.2.3.4/my/path/to/Deep-Water
export SMB_DOMAIN=my_domain_name
docker swarm leave --force
docker stack rm dwf_stack
docker volume rm dwf_stack_sedstorvol
docker volume rm dwf_stack_dwfdata
read -p "Enter SAMBA Username: " s_usr
read -sp "Enter SAMBA Password: " s_pwd
export SMB_USER=$s_usr
export SMB_PASSWD=$s_pwd
export DWF_INIT_DB=1
docker build -t=dwf-server .
docker tag dwf-server viszkoktamas93/dwf-server
docker swarm init
docker stack deploy -c docker-compose.yml dwf_stack
