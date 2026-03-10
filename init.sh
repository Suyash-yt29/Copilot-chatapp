#!/bin/bash
# Chat Application Initialization Script

set -e

echo "🚀 Initializing Chat Application..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create environment files if they don't exist
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend/.env..."
    cp backend/.env.example backend/.env
fi

if [ ! -f "frontend/.env" ]; then
    echo "📝 Creating frontend/.env..."
    cp frontend/.env.example frontend/.env
fi

# Generate JWT secrets if not present in backend/.env
if grep -q "JWT_ACCESS_SECRET=your_access_token_secret_key_here_min_32_chars" backend/.env; then
    echo "🔐 Generating JWT secrets..."
    ACCESS_SECRET=$(openssl rand -hex 32)
    REFRESH_SECRET=$(openssl rand -hex 32)
    
    # Update secrets in .env (macOS compatible)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/JWT_ACCESS_SECRET=your_access_token_secret_key_here_min_32_chars/JWT_ACCESS_SECRET=$ACCESS_SECRET/" backend/.env
        sed -i '' "s/JWT_REFRESH_SECRET=your_refresh_token_secret_key_here_min_32_chars/JWT_REFRESH_SECRET=$REFRESH_SECRET/" backend/.env
    else
        sed -i "s/JWT_ACCESS_SECRET=your_access_token_secret_key_here_min_32_chars/JWT_ACCESS_SECRET=$ACCESS_SECRET/" backend/.env
        sed -i "s/JWT_REFRESH_SECRET=your_refresh_token_secret_key_here_min_32_chars/JWT_REFRESH_SECRET=$REFRESH_SECRET/" backend/.env
    fi
fi

# Create logs directory
mkdir -p backend/logs

echo ""
echo "✅ Initialization complete!"
echo ""
echo "📚 Next steps:"
echo "1. Review and update environment variables if needed:"
echo "   - backend/.env"
echo "   - frontend/.env"
echo ""
echo "2. Start the application:"
echo "   docker-compose up --build"
echo ""
echo "3. Access the services:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend: http://localhost:5000"
echo "   - MinIO: http://localhost:9001"
echo ""
echo "📖 For more information, see DEPLOYMENT.md"
echo ""
