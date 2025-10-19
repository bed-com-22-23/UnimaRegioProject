# group 22/backend/Dockerfile
FROM node:21

# Create app dir
WORKDIR /app

# Install app dependencies (cache this layer)
COPY package*.json ./
RUN npm install

# Copy rest of the backend source
COPY . .

# Expose the port your server listens on
EXPOSE 5000

# For dev we expect nodemon. If you don't have nodemon, use "node server.js"
CMD ["npm", "run", "dev"]
