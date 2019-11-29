#!/bin/bash
export SMB_VOL=
export SMB_DOMAIN=
export SMB_USER=
export SMB_PASSWD=
docker build -t=dwf-server .
docker tag dwf-server viszkoktamas93/dwf-server
docker swarm init
docker stack deploy -c docker-compose.yml dwf_stack
