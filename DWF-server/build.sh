#!/bin/bash
sudo sysctl -w vm.max_map_count=262144
docker-compose build 
docker swarm init