#!/bin/bash

# Deployment Environment Check Script
# This script checks if all required environment variables are set

echo "🔍 Checking deployment prerequisites..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Required server-side variables
SERVER_VARS=(
  "DATABASE_URL"
  "GITHUB_TOKEN"
  "GEMINI_API_KEY"
  "CLERK_SECRET_KEY"
  "NODE_ENV"
)

# Required client-side variables
CLIENT_VARS=(
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
  "NEXT_PUBLIC_CLERK_SIGN_UP_URL"
  "NEXT_PUBLIC_CLERK_SIGN_IN_URL"
  "NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL"
)

# Check if .env file exists
if [ ! -f .env ]; then
  echo -e "${YELLOW}⚠️  .env file not found${NC}"
  echo "Creating .env.example template..."
  echo ""
else
  echo -e "${GREEN}✅ .env file found${NC}"
  echo ""
fi

# Load .env file if it exists
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

# Check server-side variables
echo "📋 Checking server-side environment variables:"
MISSING_SERVER=0
for var in "${SERVER_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo -e "  ${RED}❌ ${var}${NC} - Missing"
    MISSING_SERVER=1
  else
    echo -e "  ${GREEN}✅ ${var}${NC} - Set"
  fi
done

echo ""

# Check client-side variables
echo "📋 Checking client-side environment variables:"
MISSING_CLIENT=0
for var in "${CLIENT_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo -e "  ${RED}❌ ${var}${NC} - Missing"
    MISSING_CLIENT=1
  else
    echo -e "  ${GREEN}✅ ${var}${NC} - Set"
  fi
done

echo ""

# Check Node.js version
echo "📦 Checking Node.js version:"
NODE_VERSION=$(node -v 2>/dev/null)
if [ $? -eq 0 ]; then
  echo -e "  ${GREEN}✅ Node.js ${NODE_VERSION}${NC}"
else
  echo -e "  ${RED}❌ Node.js not found${NC}"
fi

# Check if npm is installed
echo "📦 Checking npm:"
if command -v npm &> /dev/null; then
  NPM_VERSION=$(npm -v)
  echo -e "  ${GREEN}✅ npm ${NPM_VERSION}${NC}"
else
  echo -e "  ${RED}❌ npm not found${NC}"
fi

# Check if Prisma is available
echo "📦 Checking Prisma:"
if command -v npx &> /dev/null && npx prisma --version &> /dev/null; then
  PRISMA_VERSION=$(npx prisma --version 2>/dev/null | head -n 1)
  echo -e "  ${GREEN}✅ Prisma available${NC}"
else
  echo -e "  ${YELLOW}⚠️  Prisma not found (will be installed with npm install)${NC}"
fi

echo ""

# Summary
if [ $MISSING_SERVER -eq 0 ] && [ $MISSING_CLIENT -eq 0 ]; then
  echo -e "${GREEN}✅ All required environment variables are set!${NC}"
  echo ""
  echo "🚀 Ready to deploy!"
  exit 0
else
  echo -e "${RED}❌ Some environment variables are missing${NC}"
  echo ""
  echo "Please set the missing variables in your .env file or deployment platform."
  echo "See DEPLOYMENT.md for more information."
  exit 1
fi

