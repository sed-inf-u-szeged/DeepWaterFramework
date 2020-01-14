docker network create dwf-network
docker run -d --name elasticsearch --net dwf-network -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" elasticsearch:7.3.1
docker run -d --name kibana --net dwf-network -p 5601:5601 kibana:7.3.1
