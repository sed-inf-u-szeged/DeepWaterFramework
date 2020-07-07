#!/bin/bash
docker stack rm dwf_stack
docker swarm leave --force
export SMB_VOL=//1.2.3.4/my/path/to/Deep-Water
export SMB_DOMAIN=my_domain_name
read -p "Enter SAMBA Username: " s_usr
read -sp "Enter SAMBA Password: " s_pwd
export SMB_USER=$s_usr
export SMB_PASSWD=$s_pwd
docker build -t=dwf-server .
docker tag dwf-server viszkoktamas93/dwf-server
while [ $(docker container ls -a | grep dwf_stack |  wc -c) -ne 0 ] ; do sleep 1 ; done
docker volume rm dwf_stack_esdata --force
docker volume rm dwf_stack_sedstorvol --force
while [ $(docker volume ls | grep dwf_stack |  wc -c) -ne 0 ] ; do sleep 1 ; done
docker swarm init
sudo sysctl -w vm.max_map_count=262144
docker stack deploy -c docker-compose.yml dwf_stack
