#!/bin/bash

# docker-compose up --build

# From https://nats.io/documentation/tutorials/gnatsd-docker/

# stop all containers
echo stopping all containers
docker stop $(docker ps -aq)
# remove all containers
echo removing all containers
docker rm $(docker ps -aq)
# remove all images
echo removing all images
docker rmi $(docker images -q)

#-d tag to run as daemon
# docker run -dp 4222:4222 -p 8222:8222 -p 6222:6222 --name gnatsd -ti nats:latest
docker-compose up --build