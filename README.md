# AI Cold Calling Agent with CRM Dashboard

## Overview

This repository contains a comprehensive autonomous AI cold-calling agent integrated with a custom CRM dashboard. The system is designed to manage leads, track performance, and ensure compliance with Indian telecommunications regulations while providing human-like voice interactions.

## Key Features

- **Lead Management**: Import and validate leads from CSV or API with DND registry checking
- **Campaign Management**: Define goals, generate compliant scripts, and schedule campaigns
- **Autonomous Voice AI**: Human-like conversations with emotion detection and adaptation
- **CRM Dashboard**: Real-time KPIs, interactive visualizations, and comprehensive reporting
- **Compliance**: Full adherence to Indian telecommunications regulations
- **Security**: Data encryption, role-based access, and comprehensive audit logging

## Technology Stack

- **Backend**: Node.js with Express
- **Frontend**: React with TypeScript
- **Database**: SQL with Sequelize ORM
- **Telephony**: Twilio integration for voice calls
- **Deployment**: AWS (Elastic Beanstalk, RDS, S3, CloudFront)

## System Architecture

The system follows a modular architecture with the following components:

1. **Backend Services**
   - RESTful API endpoints
   - Authentication and authorization
   - Lead and campaign management
   - Advanced voice AI engine
   - Analytics and reporting

2. **Frontend Dashboard**
   - Responsive UI with Material design
   - Real-time data visualization
   - Interactive reporting
   - Campaign management interface
   - Lead management tools

3. **Voice AI System**
   - Multiple voice personalities
   - Emotion detection and adaptation
   - Context-aware conversations
   - Natural language understanding
   - Objection handling

4. **Integration Layer**
   - Twilio telephony services
   - Database connectivity
   - AWS deployment services
   - Compliance checking services

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- SQL database (MySQL recommended)
- Twilio account with voice capabilities
- AWS account (for production deployment)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/ai-cold-calling-agent.git
   cd ai-cold-calling-agent
   ```

2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```
   cd ../frontend
   npm install
   ```

4. Set up environment variables:
   - Copy `.env.example` to `.env` in both backend and frontend directories
   - Update the variables with your specific configuration

5. Set up the database:
   ```
   cd ../backend
   npm run migrate
   ```

### Running the Application

1. Start the backend server:
   ```
   cd backend
   npm run dev
   ```

2. Start the frontend development server:
   ```
   cd frontend
   npm start
   ```

3. Access the application at `http://localhost:3000`

## Voice AI Capabilities

The system includes advanced voice AI with the following capabilities:

- **Multiple Voice Personalities**: Professional, friendly, and empathetic voices
- **Bilingual Support**: English and Hindi language capabilities
- **Emotion Detection**: Identifies customer emotions from speech
- **Adaptive Responses**: Changes tone and approach based on customer emotions
- **Natural Conversation**: Human-like dialogue with context awareness

## Deployment

### Local Development

For local development and testing, follow the installation and running instructions above.

### AWS Deployment

For production deployment on AWS:

1. Configure AWS credentials:
   ```
   aws configure
   ```

2. Run the deployment script:
   ```
   cd backend
   npm run deploy:aws
   ```

3. Follow the prompts to complete the deployment process

## Project Structure

```
ai-cold-calling-agent/
├── backend/                  # Node.js backend
│   ├── src/
│   │   ├── config/           # Configuration files
│   │   ├── controllers/      # API controllers
│   │   ├── middleware/       # Express middleware
│   │   ├── models/           # Sequelize models
│   │   ├── routes/           # API routes
│   │   ├── scripts/          # Utility scripts
│   │   ├── services/         # Business logic
│   │   └── utils/            # Helper utilities
│   ├── .env.example          # Example environment variables
│   ├── package.json          # Backend dependencies
│   └── server.js             # Entry point
├── frontend/                 # React frontend
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── api/              # API integration
│   │   ├── components/       # React components
│   │   ├── redux/            # State management
│   │   ├── types/            # TypeScript definitions
│   │   └── utils/            # Helper utilities
│   ├── .env.example          # Example environment variables
│   └── package.json          # Frontend dependencies
├── database/                 # Database scripts and migrations
├── docs/                     # Documentation
└── README.md                 # Project overview
```

## Compliance and Security

The system is designed to comply with Indian telecommunications regulations:

- **DND Registry**: Checks numbers against Do Not Disturb registry
- **Calling Hours**: Respects permitted calling hours (9 AM to 9 PM, Monday to Saturday)
- **Script Compliance**: Validates scripts for regulatory compliance
- **Data Protection**: Encrypts sensitive information
- **Audit Logging**: Maintains comprehensive logs for compliance verification

## License

[MIT License](LICENSE)

## Acknowledgments

- Twilio for telephony services
- AWS for cloud infrastructure
- React and Node.js communities for excellent frameworks
