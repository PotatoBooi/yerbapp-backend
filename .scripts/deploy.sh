#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

(
  cd "$DIR/.." # Go to project dir.

  ssh -v $DROPLET_USER@$DROPLET_IP -o StrictHostKeyChecking=no <<-EOF
    cd $SSH_PROJECT_FOLDER
    git pull
    echo "export PGADMIN_LOGIN=$PGADMIN_LOGIN" >> $BASH_ENV
    echo "export PGADMIN_PWD=$PGADMIN_PWD" >> $BASH_ENV
    echo "export POSTGRES_DB=$POSTGRES_DB" >> $BASH_ENV
    echo "export POSTGRES_USER=$POSTGRES_USER" >> $BASH_ENV
    echo "export POSTGRES_PWD=$POSTGRES_PWD" >> $BASH_ENV
    echo "export PGADMIN_PORT=$PGADMIN_PORT" >> $BASH_ENV
    echo "export JWT_SECRET_KEY=$JWT_SECRET_KEY" >> $BASH_ENV
    echo "export POSTGRES_PORT=5432" >> $BASH_ENV
    echo "export POSTGRES_HOST=postgres" >> $BASH_ENV
    source $BASH_ENV
    docker-compose pull
    docker-compose stop
    docker-compose rm -f
    docker-compose -f docker-compose.yml up -d
EOF
)