FROM ubuntu

USER root

# Make sure the package repository is up to date.
RUN rm -rvf /var/lib/apt/lists/* && apt-get update
RUN apt-get -y upgrade

# Install a basic SSH server
RUN apt-get install -y wget curl python jq unzip vim zip

RUN cd /opt && wget https://nodejs.org/dist/v7.5.0/node-v7.5.0-linux-x64.tar.gz && tar zxvf node-v7.5.0-linux-x64.tar.gz && mv node-v7.5.0-linux-x64 node

ENV PATH /opt/node/bin:$PATH

RUN export USER=root && npm install -g alexa-sdk 

RUN echo 'export PATH=$PATH:/opt/node/bin' >/etc/profile.d/node.sh

RUN mkdir /root/shi && mkdir /root/shi/src

RUN tail -f /dev/null
