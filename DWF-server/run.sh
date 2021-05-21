#!/bin/bash
docker swarm init
sudo sysctl -w vm.max_map_count=262144
docker stack deploy -c docker-compose.yml dwf_stack
