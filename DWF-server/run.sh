#!/bin/bash
export SMB_VOL=//10.6.12.200/common/team/columbus/projects/kutatas/Deep-Water
export SMB_DOMAIN=SEDDOM
read -p "Enter SAMBA Username: " s_usr
read -sp "Enter SAMBA Password: " s_pwd
export SMB_USER=$s_usr
export SMB_PASSWD=$s_pwd
docker stack deploy -c docker-compose.yml dwf_stack