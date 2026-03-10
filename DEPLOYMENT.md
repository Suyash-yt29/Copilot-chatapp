# Chat Application - Setup Guide

Generate SSL certificates for local development:

```bash
cd nginx/ssl
openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -nodes
cd ../..
```

Or use self-signed certificates (already provided):
```bash
# Certificates are pre-configured in nginx/ssl/
```

## Using Docker Compose

### Prerequisites
- Docker
- Docker Compose

### Quick Start

1. Clone the repository
```bash
cd /workspaces/Copilot-chatapp
```

2. Copy environment files
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. Update environment variables if needed
Edit `backend/.env` and `frontend/.env` with your configuration.

4. Start all services
```bash
docker-compose up --build
```

5. Access the application
- Frontend: http://localhost:3000 or https://localhost
- Backend API: http://localhost:5000 or https://localhost/api
- Nginx: https://localhost
- MinIO Console: http://localhost:9001
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### Services

- **PostgreSQL** (postgres:5432): Database
- **Redis** (redis:6379): Cache and real-time data
- **MinIO** (minio:9000): S3-compatible storage
- **Backend** (backend:5000): Node.js Express API
- **Frontend** (frontend:3000): React application
- **Nginx** (nginx:80/443): Reverse proxy

### Stopping Services

```bash
docker-compose down
```

To remove volumes and start fresh:
```bash
docker-compose down -v
```

## Manual Setup (Without Docker)

### Backend Setup

1. Install dependencies
```bash
cd backend
npm install
```

2. Configure environment
```bash
cp .env.example .env
# Edit .env with your database and Redis credentials
```

3. Run migrations
```bash
npm run migrate
```

4. Start backend
```bash
npm run dev
```

### Frontend Setup

1. Install dependencies
```bash
cd frontend
npm install
```

2. Configure environment
```bash
cp .env.example .env
# Update VITE_API_URL and VITE_SOCKET_URL
```

3. Start development server
```bash
npm run dev
```

## Database

### Automatic Setup
Database is automatically initialized when the backend container starts. Tables are created with:
- Users table with unique email and public key storage
- Messages table with sender/receiver tracking
- Status tracking (sent/delivered/seen)
- Automatic indexing for performance

### Manual Setup
Connect to PostgreSQL:
```bash
psql -h localhost -U chatapp -d chatapp
```

Run migrations:
```sql
CREATE EXTENSION "uuid-ossp";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  public_key TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  encrypted_message TEXT NOT NULL,
  iv TEXT NOT NULL,
  media_url VARCHAR(2048),
  status VARCHAR(20) DEFAULT 'sent',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_conversation ON messages(sender_id, receiver_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_users_email ON users(email);
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/public-key/:userId` - Get user's public key

### Messages
- `GET /api/messages/conversation/:userId` - Get conversation history
- `GET /api/messages/conversations` - Get all conversations
- `POST /api/messages/mark-read` - Mark messages as read

## WebSocket Events

### Client -> Server
- `send_message` - Send new message
- `message_delivered` - Confirm delivery
- `message_seen` - Mark message as seen
- `typing_start` - User started typing
- `typing_stop` - User stopped typing

### Server -> Client
- `message_received` - New message received
- `user_online` - User came online
- `user_offline` - User went offline
- `user_typing` - User is typing
- `user_stopped_typing` - User stopped typing
- `undelivered_messages` - Messages delivered while offline

## Security Features

- **JWT Authentication**: Access and refresh tokens
- **Password Hashing**: bcrypt with 12 salt rounds
- **End-to-End Encryption**: RSA-OAEP encryption for messages
- **CORS**: Configured for frontend domain
- **Rate Limiting**: Prevents brute force and DoS attacks
- **Helmet**: Security headers for API
- **HTTPS/TLS**: Nginx reverse proxy with SSL certificates
- **Input Validation**: express-validator for all inputs
- **Secure CORS**: Credentials and origin verification

## Deployment to VPS

### Prerequisites
- Ubuntu 20.04+ or similar
- Docker and Docker Compose installed
- Domain name (optional, for SSL)

### Steps

1. Connect to VPS
```bash
ssh user@your-vps-ip
```

2. Clone repository
```bash
git clone https://github.com/your-repo/chatapp.git
cd chatapp
```

3. Create environment files
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

4. Update configuration
```bash
# Edit backend/.env
nano backend/.env

# Update:
# - NODE_ENV=production
# - JWT_ACCESS_SECRET (generate secure random 32+ chars)
# - JWT_REFRESH_SECRET (generate secure random 32+ chars)
# - CORS_ORIGIN=https://your-domain.com

# Edit frontend/.env
nano frontend/.env

# Update:
# - VITE_API_URL=https://your-domain.com/api
# - VITE_SOCKET_URL=https://your-domain.com
```

5. Generate SSL certificates (using Let's Encrypt)
```bash
# Install certbot
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates to nginx/ssl
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ~/chatapp/nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ~/chatapp/nginx/ssl/key.pem
sudo chown $(whoami):$(whoami) ~/chatapp/nginx/ssl/*
```

6. Create production environment
```bash
# Copy docker-compose.prod.yml or update docker-compose.yml
# Change port bindings if needed
# Update CORS_ORIGIN in backend/.env
```

7. Deploy
```bash
docker-compose up -d --build
```

8. View logs
```bash
docker-compose logs -f
```

### SSL Certificate Renewal
```bash
sudo certbot renew --quiet
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ~/chatapp/nginx/ssl/cert.pem
cp /etc/letsencrypt/live/your-domain.com/privkey.pem ~/chatapp/nginx/ssl/key.pem
docker-compose restart nginx
```

## Troubleshooting

### Containers not starting
```bash
# Check logs
docker-compose logs -f

# Rebuild containers
docker-compose down -v
docker-compose up --build
```

### Database connection errors
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check logs
docker-compose logs postgres

# Verify database exists
docker-compose exec postgres psql -U chatapp -l
```

### Socket.IO connection errors
```bash
# Check backend logs
docker-compose logs backend

# Verify CORS configuration
# Check frontend .env for correct VITE_SOCKET_URL
```

### SSL Certificate errors
```bash
# Regenerate self-signed certificates
cd nginx/ssl
rm -f cert.pem key.pem
openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -nodes
cd ../..
docker-compose restart nginx
```

## Performance Optimization

- **Database**: Connection pooling configured (min:2, max:10)
- **Redis**: Used for session management and caching
- **Nginx**: gzip compression enabled
- **Socket.IO**: Message buffering and batching
- **Frontend**: React lazy loading and code splitting

## Monitoring

Check services health:
```bash
docker-compose ps
```

View real-time logs:
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

Check resource usage:
```bash
docker stats
```

## Additional Notes

- Keep `.env` files secure and never commit them to git
- Regularly update dependencies and Docker images
- Monitor logs for errors and security issues
- Back up PostgreSQL data regularly
- Test SSL certificate renewal process before deployment
- Scale horizontally using multiple backend instances if needed

For more information, see:
- [Express.js Documentation](https://expressjs.com/)
- [Socket.IO Documentation](https://socket.io/)
- [React Documentation](https://react.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
