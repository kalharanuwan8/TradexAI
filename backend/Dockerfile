# Use Node.js LTS slim image
FROM node:20-slim

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm install --production

# Bundle app source
COPY . .

# Expose the port the app runs on
EXPOSE 3001

# Define environment variables (can be overridden by docker-compose or -e flag)
ENV PORT=3001
ENV NODE_ENV=production

# Start the application
CMD [ "npm", "start" ]
