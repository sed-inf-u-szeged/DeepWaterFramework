#!/bin/bash
export SMB_VOL=
export SMB_DOMAIN=
export SMB_USER=
export SMB_PASSWD=
export DWF_INIT_DB=yes
docker stack rm dwf_stack
docker build -t=dwf-server .
docker tag dwf-server viszkoktamas93/dwf-server
docker swarm init
sleep 10s
docker stack deploy -c docker-compose.yml dwf_stack
