FROM node:12-alpine
WORKDIR /home/app
COPY package*.json ./
RUN npm install 
COPY . .
EXPOSE 8000
CMD ["npm", "run", "start-prod"]