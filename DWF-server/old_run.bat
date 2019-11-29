docker network create dwf-network
docker run -d --name elasticsearch --net dwf-network -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" elasticsearch:7.3.1
docker run -d --name kibana --net dwf-network -p 5601:5601 kibana:7.3.1
docker container stop dwf-server
docker container rm dwf-server
docker build -t=dwf-server .
docker run --name dwf-server --net dwf-network -p 4000:12345 dwf-server