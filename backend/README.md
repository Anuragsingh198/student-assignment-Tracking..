# Smart Assignment & Evaluation System - Backend

A production-grade backend API for a Smart Assignment & Evaluation System built with Node.js, Express, TypeScript, and MongoDB.

## 🚀 Features

- **JWT Authentication** with access/refresh tokens
- **Role-Based Access Control** (Teacher/Student)
- **Assignment Management** with publishing workflow
- **Submission System** with versioning and late submission tracking
- **AI-Powered Feedback** generation for grammar and clarity analysis
- **Secure API** with rate limiting, CORS, and input validation
- **Scalable Architecture** with proper error handling and logging

## 🏗️ Architecture

### Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (Access + Refresh tokens)
- **Validation**: Zod schemas
- **Security**: Helmet, CORS, Rate limiting
- **AI Service**: Abstracted for easy provider swapping

### Project Structure
```
src/
├── config/           # Environment configuration
├── controllers/      # Route handlers
├── models/          # MongoDB schemas
├── routes/          # API route definitions
├── services/        # Business logic (Auth, AI)
├── middleware/      # Custom middleware
├── utils/           # Helper functions and validation
└── types/           # TypeScript type definitions
```

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/profile` - Get user profile

### Assignments (Teacher Only for Creation)
- `POST /api/assignments` - Create assignment
- `GET /api/assignments` - List assignments
- `GET /api/assignments/:id` - Get assignment details
- `PUT /api/assignments/:id` - Update assignment
- `DELETE /api/assignments/:id` - Delete assignment
- `PATCH /api/assignments/:id/publish` - Publish assignment
- `PATCH /api/assignments/:id/unpublish` - Unpublish assignment

### Submissions
- `POST /api/submissions/:assignmentId` - Submit assignment
- `GET /api/submissions/my` - Get my submissions
- `GET /api/submissions/:id` - Get submission details
- `GET /api/submissions/assignment/:assignmentId` - Get assignment submissions (Teacher)
- `GET /api/submissions/versions/:assignmentId` - Get submission versions

### Evaluations (Teacher Only)
- `POST /api/evaluations/:submissionId` - Evaluate submission
- `GET /api/evaluations/feedback/:submissionId` - Get submission feedback
- `PUT /api/evaluations/feedback/:submissionId` - Update feedback
- `POST /api/evaluations/ai-feedback/:submissionId` - Generate AI feedback

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB 5+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-assignment-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```

   Configure your `.env` file:
   ```env
   NODE_ENV=development
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/smart-assignment-system
   JWT_ACCESS_SECRET=your-super-secret-access-key-change-in-production
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
   JWT_ACCESS_EXPIRE=15m
   JWT_REFRESH_EXPIRE=7d
   BCRYPT_ROUNDS=12
   ```

4. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest

   # Or using local MongoDB installation
   mongod
   ```

5. **Build and run**
   ```bash
   # Development
   npm run dev

   # Production
   npm run build
   npm start
   ```

## 🔐 Security Features

### Authentication & Authorization
- JWT tokens with separate access/refresh mechanisms
- Password hashing with bcrypt (12 rounds)
- Role-based access control (TEACHER/STUDENT)
- Token expiration and refresh handling

### API Security
- Rate limiting (100 requests per 15 minutes)
- CORS configuration
- Helmet security headers
- Input validation with Zod schemas
- SQL injection prevention through parameterized queries

### Data Protection
- Sensitive data exclusion from responses
- Secure password storage
- Environment-based configuration
- Error sanitization for production

## 🤖 AI Integration

The system includes an abstracted AI service for:
- **Grammar Analysis**: Scoring text quality (0-100)
- **Clarity Assessment**: Evaluating communication effectiveness
- **Feedback Generation**: AI-suggested comments for submissions

### AI Service Architecture
- **Abstraction Layer**: Easy to swap AI providers
- **Fallback Handling**: Graceful degradation when AI is unavailable
- **Async Processing**: Non-blocking AI operations
- **Error Resilience**: Continues functioning without AI features

## 📊 Business Rules

### Assignment Workflow
1. Teachers create assignments (initially unpublished)
2. Teachers can edit unpublished assignments
3. Publishing makes assignments visible to students
4. Published assignments cannot be modified if they have submissions

### Submission Rules
1. Students can only submit to published assignments
2. Late submissions are automatically detected
3. Students can re-submit (creates new version)
4. Submissions cannot be edited after evaluation

### Evaluation Process
1. Only assignment teachers can evaluate submissions
2. AI feedback is generated automatically
3. Teachers can override AI suggestions
4. Evaluations are final (submissions locked)

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint

# Format code
npm run format
```

## 📈 Performance & Scalability

### Database Optimization
- **Indexes**: Optimized queries with compound indexes
- **Aggregation**: Efficient data processing for submissions
- **Pagination**: Prevents large result sets
- **Connection Pooling**: MongoDB connection optimization

### API Performance
- **Compression**: Response compression with gzip
- **Caching**: Strategic caching opportunities identified
- **Async Operations**: Non-blocking I/O operations
- **Rate Limiting**: Prevents abuse and ensures fair usage

### Monitoring & Logging
- **Error Tracking**: Centralized error handling
- **Health Checks**: `/health` endpoint for monitoring
- **Structured Logging**: Consistent log format
- **Performance Metrics**: Response time tracking

## 🔄 Deployment

### Environment Variables
```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://production-server/smart-assignment-system
JWT_ACCESS_SECRET=<strong-random-secret>
JWT_REFRESH_SECRET=<different-strong-random-secret>
AI_SERVICE_API_KEY=<ai-service-key>
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

### Production Checklist
- [ ] Environment variables configured
- [ ] MongoDB connection secured
- [ ] JWT secrets rotated
- [ ] Rate limiting configured
- [ ] CORS origins restricted
- [ ] SSL/TLS enabled
- [ ] Monitoring and logging set up
- [ ] Health checks configured

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Check the API documentation at `/api/docs`
- Review the health endpoint at `/health`
- Check server logs for error details

---

**Built with ❤️ for educational excellence**
