#!/bin/bash

# Colors for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
echo -e "${YELLOW}Checking if Docker is running...${NC}"
if ! docker info > /dev/null 2>&1; then
    echo -e "${YELLOW}Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Build and start containers
echo -e "${YELLOW}Building and starting containers...${NC}"
docker-compose up --build -d

# Wait for services to be ready
echo -e "${YELLOW}Waiting for services to be ready...${NC}"
echo -e "${YELLOW}This may take a few moments...${NC}"

# Check if backend is ready
echo -e "${YELLOW}Checking if backend is ready...${NC}"
attempt=0
max_attempts=30
until $(curl --output /dev/null --silent --head --fail http://localhost:8080/health); do
    if [ ${attempt} -eq ${max_attempts} ]; then
        echo -e "${YELLOW}Backend service is not ready after ${max_attempts} attempts. Something might be wrong.${NC}"
        echo -e "${YELLOW}Please check the logs with: docker-compose logs backend${NC}"
        exit 1
    fi
    
    printf '.'
    attempt=$(($attempt+1))
    sleep 1
done

echo -e "\n${GREEN}All services are up and running!${NC}"
echo -e "${GREEN}------------------------------------${NC}"
echo -e "${GREEN}Frontend: http://localhost:3000${NC}"
echo -e "${GREEN}Backend API: http://localhost:8080${NC}"
echo -e "${GREEN}API Health Check: http://localhost:8080/health${NC}"
echo -e "${GREEN}------------------------------------${NC}"
echo -e "${YELLOW}To stop the services, run: docker-compose down${NC}"
echo -e "${YELLOW}To see logs, run: docker-compose logs -f${NC}"

# Keep script running until user stops it
echo -e "${YELLOW}Press Ctrl+C to exit...${NC}"
trap "echo -e '\n${YELLOW}Exiting...${NC}'" INT
tail -f /dev/null