FROM node:lts-alpine3.20
ENV NODE_ENV=production

 
WORKDIR /app

COPY [".","./"]

#ENV TZ='America/Detroit'
#RUN apk add --no-cache tzdata
#RUN apk --update add tzdata && cp /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone && apk del tzdata


RUN apk add --no-cache tzdata
ENV TZ=America/Detroit

RUN npm install --production

COPY . .

CMD [ "node","server.js"]

#America/Detroit
#https://dev.to/burakboduroglu/dockerizing-a-nodejs-app-a-comprehensive-guide-for-easy-deployment-13o1
#https://github.com/nodejs/docker-node?tab=readme-ov-file
#https://www.digitalocean.com/community/tutorials/how-to-build-a-node-js-application-with-docker

#C:\Users\treya\Documents\Dev\HAExpress>docker build .
#C:\Users\treya\Documents\Dev\HAExpress>docker run -p 3000:3000 -p 3001:3001 -i 8cbad8036667