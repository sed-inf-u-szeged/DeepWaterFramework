#!/bin/bash
export SMB_VOL=//10.6.12.200/common/team/columbus/projects/kutatas/Deep-Water
export SMB_DOMAIN=SEDDOM
read -p "Enter SAMBA Username: " s_usr
read -sp "Enter SAMBA Password: " s_pwd
export SMB_USER=$s_usr
export SMB_PASSWD=$s_pwd
sudo sysctl -w vm.max_map_count=262144
docker-compose up 
docker swarm init
