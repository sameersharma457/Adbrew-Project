# Stage 1: Obtain Node 16 and Yarn from official node image
FROM node:16-buster-slim AS node_base

# Stage 2: Main image based on Python 3.8 Buster
FROM python:3.8-buster

# Switch default shell to bash
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

# Configure Debian Buster archived repositories (since Buster reached EOL)
RUN sed -i 's/deb.debian.org/archive.debian.org/g' /etc/apt/sources.list \
 && sed -i 's|security.debian.org/debian-security|archive.debian.org/debian-security|g' /etc/apt/sources.list \
 && sed -i '/buster-updates/d' /etc/apt/sources.list

RUN apt-get -o Acquire::Check-Valid-Until=false update \
 && apt-get install -y --no-install-recommends curl nano wget nginx git \
 && rm -rf /var/lib/apt/lists/*

# Install MongoDB 4.4 server & client tools
RUN ln -s /bin/echo /bin/systemctl \
 && wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | apt-key add - \
 && echo "deb http://repo.mongodb.org/apt/debian buster/mongodb-org/4.4 main" | tee /etc/apt/sources.list.d/mongodb-org-4.4.list \
 && apt-get -o Acquire::Check-Valid-Until=false update \
 && apt-get install -y --no-install-recommends mongodb-org \
 && rm -rf /var/lib/apt/lists/*

# Install Node.js 16 and Yarn from node_base
COPY --from=node_base /usr/local/bin/node /usr/local/bin/node
COPY --from=node_base /usr/local/include/node /usr/local/include/node
COPY --from=node_base /usr/local/lib/node_modules /usr/local/lib/node_modules
COPY --from=node_base /opt/yarn-v1.22.19 /opt/yarn-v1.22.19
RUN ln -s /opt/yarn-v1.22.19/bin/yarn /usr/local/bin/yarn \
 && ln -s /opt/yarn-v1.22.19/bin/yarnpkg /usr/local/bin/yarnpkg \
 && ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
 && ln -s /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

ENV ENV_TYPE=staging
ENV MONGO_HOST=mongo
ENV MONGO_PORT=27017

ENV PYTHONPATH=/src/

# Copy python dependencies
COPY src/requirements.txt .

# Install Python packages
RUN pip install --no-cache-dir -r requirements.txt
