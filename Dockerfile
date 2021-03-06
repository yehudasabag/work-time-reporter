
# build the server
FROM cypress/base:10.16.0
# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Copy all besides what that is ignored by .dockerignore
COPY package.json /usr/src/app/package.json
COPY package-lock.json /usr/src/app/package-lock.json
RUN npm install --only=production
COPY . .
EXPOSE 8080

CMD [ "npm", "start" ]


