# Use an official Node.js runtime as the base image
FROM node:18.19.0-buster as build

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package.json  ./

# Install dependencies
RUN npm install

# Copy the remaining app files to the working directory
COPY . .

# Use ARG to pass build-time variables        
ARG REACT_APP_BACKEND_API_URL
ARG REACT_APP_CLIENT_ID

# Expose port 5000
#EXPOSE 5000

# Build the React app
RUN npm run build

    
# Use a lightweight Node.js image as the base image for the production environment
FROM node:alpine

# Set the working directory in the container
WORKDIR /app

# Copy the build files from the previous stage
COPY --from=build /app/build ./build

# Install serve to run the production server
RUN npm install -g serve

# Expose port 5000
EXPOSE 5000

# Command to run the production server
CMD ["serve", "-s", "build", "-l", "5000"]

