#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER kenbright_user WITH PASSWORD 'kenbright360';
    GRANT ALL PRIVILEGES ON DATABASE kenbright_360 TO kenbright_user;
EOSQL
