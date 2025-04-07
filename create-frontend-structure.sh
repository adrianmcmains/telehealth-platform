#!/bin/bash
# Script to create the telehealth platform frontend folder structure

# Set colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Creating telehealth platform frontend folder structure...${NC}"

# Create main directories
mkdir -p frontend/src/{components,contexts,pages,services,utils}
mkdir -p frontend/src/components/{auth,layout}
mkdir -p frontend/src/pages/{appointments,doctors,profile}
mkdir -p frontend/src/pages/appointments/\[id\]
mkdir -p frontend/public

echo -e "${GREEN}Main directory structure created.${NC}"

# Create nested directories for pages
mkdir -p frontend/src/pages/api

# Create components
echo -e "${YELLOW}Creating component files...${NC}"
touch frontend/src/components/Layout.js
touch frontend/src/components/ProtectedRoute.js
touch frontend/src/components/auth/TwoFASetup.js
touch frontend/src/components/auth/TwoFAVerification.js
touch frontend/src/components/auth/PaymentForm.js
touch frontend/src/components/auth/PaymentDialog.js

# Create context files
echo -e "${YELLOW}Creating context files...${NC}"
touch frontend/src/contexts/AuthContext.js

# Create service files
echo -e "${YELLOW}Creating service files...${NC}"
touch frontend/src/services/api.js
touch frontend/src/services/payment.js
touch frontend/src/services/twofa.js
touch frontend/src/services/webrtc.js

# Create util files
echo -e "${YELLOW}Creating utility files...${NC}"
touch frontend/src/utils/emotionCache.js

# Create page files
echo -e "${YELLOW}Creating page files...${NC}"
touch frontend/src/pages/_app.js
touch frontend/src/pages/index.js
touch frontend/src/pages/login.js
touch frontend/src/pages/register.js
touch frontend/src/pages/profile.js
touch frontend/src/pages/services.js
touch frontend/src/pages/conditions.js

# Create appointment pages
touch frontend/src/pages/appointments/index.js
touch frontend/src/pages/appointments/schedule.js
touch frontend/src/pages/appointments/\[id\]/index.js
touch frontend/src/pages/appointments/\[id\]/video.js
touch frontend/src/pages/appointments/\[id\]/payment-success.js

# Create doctors pages
touch frontend/src/pages/doctors/index.js

# Create next.config.js
echo -e "${YELLOW}Creating Next.js config files...${NC}"
cat > frontend/next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
    ];
  },
}

module.exports = nextConfig
EOF

# Create package.json
cat > frontend/package.json << 'EOF'
{
  "name": "telehealth-platform-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@emotion/cache": "^11.10.5",
    "@emotion/react": "^11.10.5",
    "@emotion/server": "^11.10.0",
    "@emotion/styled": "^11.10.5",
    "@mui/icons-material": "^5.11.0",
    "@mui/material": "^5.11.0",
    "@mui/x-date-pickers": "^5.0.11",
    "axios": "^1.2.1",
    "date-fns": "^2.29.3",
    "next": "13.0.7",
    "react": "18.2.0",
    "react-dom": "18.2.0"
  },
  "devDependencies": {
    "eslint": "8.30.0",
    "eslint-config-next": "13.0.7"
  }
}
EOF

# Create .gitignore file
cat > frontend/.gitignore << 'EOF'
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# local env files
.env*.local

# vercel
.vercel
EOF
