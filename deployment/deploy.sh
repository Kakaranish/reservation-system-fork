#!/bin/bash

mv ../backend/.env ../backend/.env-temp
cp .env-backend-prod ../backend/.env
cd ../backend
docker build -t ressystem.azurecr.io/res-system-backend .
docker push ressystem.azurecr.io/res-system-backend
mv .env-temp .env

cd ../frontend
docker build -t ressystem.azurecr.io/res-system .
docker push ressystem.azurecr.io/res-system