# 🚀 Production-Ready Secure Real-Time Chat Application

A complete, production-grade secure real-time chat application with end-to-end encryption, built with modern technologies and best practices.

## 📋 Features

### Security
- ✅ End-to-End RSA-OAEP Encryption
- ✅ JWT Authentication with Refresh Tokens
- ✅ Bcrypt Password Hashing (12 rounds)
- ✅ Rate Limiting & CORS Protection
- ✅ Helmet Security Headers
- ✅ HTTPS/TLS Support
- ✅ Input Validation & Sanitization
- ✅ Secure Token Rotation

### Real-Time Messaging
- ✅ WebSocket (Socket.IO) for instant messaging
- ✅ Message status tracking (sent/delivered/seen)
- ✅ Online/offline indicators
- ✅ Typing indicators
- ✅ Undelivered message handling
- ✅ Automatic reconnection

### Backend Features
- ✅ RESTful API with Express.js
- ✅ PostgreSQL database with migrations
- ✅ Redis for caching and real-time data
- ✅ Connection pooling
- ✅ Cursor-based pagination
- ✅ Winston logging
- ✅ Morgan request logging
- ✅ Comprehensive error handling

### Frontend Features
- ✅ React 18 with TypeScript
- ✅ Vite for fast development
- ✅ Zustand state management
- ✅ Socket.IO client integration
- ✅ Web Crypto API for encryption
- ✅ Responsive design
- ✅ Auto-scrolling conversations
- ✅ Search functionality

### Infrastructure
- ✅ Docker containerization
- ✅ Docker Compose orchestration
- ✅ Nginx reverse proxy
- ✅ MinIO S3-compatible storage
- ✅ SSL/TLS support
- ✅ Production-ready configuration

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Nginx (Reverse Proxy)                │
│                    (SSL/TLS Termination)                    │
└────────────────┬────────────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
    ┌───▼───┐         ┌───▼────┐
    │Backend│         │Frontend│
    │Express│         │  React │
    │ API   │         │  Vite  │
    └───┬───┘         └────────┘
        │
    ┌───┴──────────────────┐
    │                      │
┌───▼───┐          ┌──────▼──┐
│  DB   │          │  Redis  │
│   PG  │          │  Cache  │
└───────┘          └────┬────┘
                        │
                    ┌───▼────┐
                    │ MinIO  │
                    │ S3         │
                    └────────┘
```

## 📁 Project Structure

```
Copilot-chatapp/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/      # Route controllers
│   │   ├── middleware/       # Express middleware
│   │   ├── models/           # Database models
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   ├── sockets/          # WebSocket handlers
│   │   ├── utils/            # Utility functions
│   │   ├── migrations/       # Database migrations
│   │   └── index.ts          # Server entry point
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── context/          # State management
│   │   ├── hooks/            # Custom hooks
│   │   ├── services/         # API services
│   │   ├── utils/            # Utilities
│   │   ├── styles/           # CSS files
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── .env.example
├── nginx/
│   ├── nginx.conf            # Reverse proxy config
│   └── ssl/                  # SSL certificates
├── docker-compose.yml        # Docker Compose orchestration
├── DEPLOYMENT.md             # Deployment guide
└── README.md
```

## 🚀 Quick Start

### Using Docker Compose (Recommended)

```bash
# Clone repository
cd /workspaces/Copilot-chatapp

# Setup environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start all services
docker-compose up --build
```

Access the application:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:5000
- **Nginx**: https://localhost (with self-signed cert)
- **MinIO**: http://localhost:9001

### Local Development

**Backend:**
```bash
cd backend
npm install
npm run migrate
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 🔐 Authentication Flow

```
1. User registers
   ├─ Client generates RSA key pair
   ├─ Sends email, password, and public key
   └─ Backend stores user with hashed password

2. User logs in
   ├─ Server validates credentials
   ├─ Generates JWT access token (15m)
   ├─ Generates refresh token (7d)
   └─ Returns tokens to client

3. Token refresh
   ├─ Client sends refresh token
   └─ Server generates new access token

4. API requests
   ├─ Client sends Authorization header with JWT
   └─ Middleware validates token
```

## 💬 Message Encryption

```
1. Sender prepares message
   ├─ Fetches receiver's public key
   ├─ Encrypts message with RSA-OAEP
   └─ Sends encrypted payload

2. Message transmission
   ├─ Server stores encrypted message in DB
   └─ Socket.IO delivers to receiver if online

3. Receiver decrypts
   ├─ Retrieves message from Socket.IO
   ├─ Decrypts with local private key
   └─ Displays to user

4. Delivery status
   └─ Updates: sent → delivered → seen
```

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  public_key TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Messages Table
```sql
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
```

## 🔌 WebSocket Events

### Client → Server
- `send_message` - Send encrypted message
- `message_delivered` - Confirm delivery
- `message_seen` - Mark as seen
- `typing_start` - User started typing
- `typing_stop` - User stopped typing

### Server → Client
- `message_received` - New message arrived
- `user_online` - User connected
- `user_offline` - User disconnected
- `user_typing` - User is typing
- `user_stopped_typing` - Typing stopped
- `message_seen_notification` - Message marked as seen
- `undelivered_messages` - Messages from offline period

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
GET    /api/auth/public-key/:userId
```

### Messages
```
GET    /api/messages/conversation/:userId?cursor=...
GET    /api/messages/conversations
POST   /api/messages/mark-read
```

## 🔒 Security Headers

```
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: no-referrer-when-downgrade
Content-Security-Policy: default-src 'self'
Strict-Transport-Security: max-age=31536000
```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Real-time**: Socket.IO 4.5
- **Auth**: JWT, bcrypt
- **Logging**: Winston, Morgan
- **Security**: Helmet, express-validator
- **Language**: TypeScript

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **State**: Zustand
- **HTTP**: Axios
- **Real-time**: Socket.IO Client
- **Styling**: CSS3

### Infrastructure
- **Container**: Docker
- **Orchestration**: Docker Compose
- **Reverse Proxy**: Nginx
- **Storage**: MinIO (S3-compatible)
- **SSL/TLS**: Let's Encrypt compatible

## 📈 Performance

- **Connection Pooling**: 2-10 connections
- **Compression**: gzip enabled
- **Caching**: Redis for sessions
- **Pagination**: Cursor-based (50 messages/page)
- **Rate Limiting**: 100 requests/15min per IP
- **Database Indexes**: On all foreign keys and frequently searched columns

## 🧪 Testing

Run test suite:
```bash
# Backend tests
cd backend
npm run test

# Frontend tests
cd frontend
npm run test
```

## 🚢 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for:
- Docker Compose setup
- VPS deployment steps
- SSL certificate configuration
- Environment configuration
- Health checks monitoring
- Database backup strategy

## 📝 Environment Variables

### Backend (.env)
```env
NODE_ENV=production
PORT=5000
DB_HOST=postgres
DB_NAME=chatapp
DB_USER=chatapp
DB_PASSWORD=securepassword
REDIS_HOST=redis
REDIS_PORT=6379
JWT_ACCESS_SECRET=your_secret_key_32_chars_min
JWT_REFRESH_SECRET=your_secret_key_32_chars_min
CORS_ORIGIN=https://yourdomain.com
S3_ENDPOINT=http://minio:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
```

### Frontend (.env)
```env
VITE_API_URL=https://yourdomain.com/api
VITE_SOCKET_URL=https://yourdomain.com
```

## 🔄 Message Flow Diagram

```
1. User sends message
   │
   ├─► Validate payload
   ├─► Fetch receiver's public key
   ├─► Encrypt message with RSA
   └─► Send to backend

2. Backend processes
   │
   ├─► Authenticate user (JWT)
   ├─► Validate inputs
   ├─► Store in PostgreSQL
   ├─► Check Redis for receiver
   └─► Emit Socket.IO event if online

3. Delivery
   │
   ├─► If online → Deliver immediately
   │               Update status to "delivered"
   │
   └─► If offline → Store for later
                    Update status to "sent"

4. Receiver connects
   │
   ├─► Fetch undelivered messages
   ├─► Emit via Socket.IO
   ├─► Client receives and decrypts
   └─► Send "seen" acknowledgment
```

## 🐛 Troubleshooting

### Backend container not running
```bash
docker-compose logs backend
docker-compose up --build backend
```

### Database connection error
```bash
# Verify PostgreSQL is running
docker-compose ps postgres

# Check database creation
docker-compose exec postgres psql -U chatapp -l
```

### Frontend can't connect to API
```bash
# Check CORS configuration in backend/.env
# Verify VITE_API_URL in frontend/.env
# Check nginx routing in nginx/nginx.conf
```

### SSL certificate errors
```bash
# For development (already included):
# Self-signed certificates in nginx/ssl/

# For production:
# Use Let's Encrypt certificates
```

## 📚 Additional Resources

- [Express.js Docs](https://expressjs.com/)
- [Socket.IO Docs](https://socket.io/docs/)
- [React Docs](https://react.dev/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [Docker Docs](https://docs.docker.com/)

## 📄 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ for secure and real-time communication**