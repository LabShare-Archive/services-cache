#For install docker build -t services-cache .
#docker run -d -p 6379:6379  services-cache:redis
FROM ubuntu:12.04
MAINTAINER Jamil Falconi <jamil.falconi@nih.gov>

#install prerequisites
RUN apt-get update && apt-get install -y  build-essential &&\
    apt-get install -y tcl8.5 &&\
    apt-get install -y wget &&\
    wget http://download.redis.io/releases/redis-3.2.5.tar.gz &&\
    tar xzf redis-3.2.5.tar.gz &&\
    cd redis-3.2.5  &&\
    make  &&\
    make install
#Expose the image on redis' port.
EXPOSE 6379

VOLUME /data
WORKDIR /data
#Starts the process with protected mode on , with this Redis is visible from the host's redis cli.
CMD [ "redis-server", "--protected-mode", "no"]