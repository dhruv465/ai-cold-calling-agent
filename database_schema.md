# Database Schema: AI Cold-Calling Agent with CRM Dashboard

This document outlines the database schema for the AI cold-calling system with CRM dashboard.

## Database Type
SQL (MySQL/PostgreSQL) on AWS RDS

## Tables

### Users
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  role VARCHAR(20) NOT NULL, -- 'admin', 'manager', 'agent'
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Leads
```sql
CREATE TABLE leads (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  phone_number VARCHAR(15) NOT NULL,
  email VARCHAR(100),
  language_preference VARCHAR(20) DEFAULT 'english', -- 'english', 'hindi', etc.
  lead_source VARCHAR(50),
  status VARCHAR(20) DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'converted', 'rejected'
  dnd_status BOOLEAN DEFAULT FALSE,
  dnd_checked_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Campaigns
```sql
CREATE TABLE campaigns (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  goal TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'active', 'paused', 'completed'
  created_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Campaign_Scripts
```sql
CREATE TABLE campaign_scripts (
  id SERIAL PRIMARY KEY,
  campaign_id INT REFERENCES campaigns(id),
  language VARCHAR(20) NOT NULL, -- 'english', 'hindi', etc.
  script_content TEXT NOT NULL,
  version INT DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Campaign_Leads
```sql
CREATE TABLE campaign_leads (
  id SERIAL PRIMARY KEY,
  campaign_id INT REFERENCES campaigns(id),
  lead_id INT REFERENCES leads(id),
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'called', 'completed', 'failed'
  priority INT DEFAULT 0,
  scheduled_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Calls
```sql
CREATE TABLE calls (
  id SERIAL PRIMARY KEY,
  campaign_lead_id INT REFERENCES campaign_leads(id),
  twilio_call_id VARCHAR(100),
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  duration INT, -- in seconds
  status VARCHAR(20), -- 'initiated', 'ringing', 'in-progress', 'completed', 'failed', 'no-answer'
  recording_url VARCHAR(255),
  call_cost DECIMAL(10,4),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Conversations
```sql
CREATE TABLE conversations (
  id SERIAL PRIMARY KEY,
  call_id INT REFERENCES calls(id),
  transcript TEXT,
  sentiment_score DECIMAL(3,2),
  intent VARCHAR(50),
  outcome VARCHAR(20), -- 'interested', 'not-interested', 'callback', 'disconnected'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Conversation_Segments
```sql
CREATE TABLE conversation_segments (
  id SERIAL PRIMARY KEY,
  conversation_id INT REFERENCES conversations(id),
  speaker VARCHAR(10), -- 'agent', 'customer'
  content TEXT,
  start_time INT, -- offset in seconds from call start
  end_time INT, -- offset in seconds from call start
  sentiment_score DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Callbacks
```sql
CREATE TABLE callbacks (
  id SERIAL PRIMARY KEY,
  lead_id INT REFERENCES leads(id),
  campaign_id INT REFERENCES campaigns(id),
  requested_time TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'completed', 'missed', 'cancelled'
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Knowledge_Base
```sql
CREATE TABLE knowledge_base (
  id SERIAL PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  language VARCHAR(20) NOT NULL, -- 'english', 'hindi', etc.
  created_by INT REFERENCES users(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Reports
```sql
CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  report_type VARCHAR(50) NOT NULL,
  parameters JSON,
  created_by INT REFERENCES users(id),
  schedule VARCHAR(50), -- 'daily', 'weekly', 'monthly', 'none'
  recipients TEXT, -- comma-separated emails
  last_run_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Notifications
```sql
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  title VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'alert', 'info', 'success', 'warning'
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Audit_Logs
```sql
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INT,
  details JSON,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Indexes

```sql
-- Leads table indexes
CREATE INDEX idx_leads_phone ON leads(phone_number);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_source ON leads(lead_source);

-- Campaign indexes
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_dates ON campaigns(start_date, end_date);

-- Call indexes
CREATE INDEX idx_calls_status ON calls(status);
CREATE INDEX idx_calls_times ON calls(start_time, end_time);

-- Conversation indexes
CREATE INDEX idx_conversations_outcome ON conversations(outcome);
CREATE INDEX idx_conversations_sentiment ON conversations(sentiment_score);

-- Callback indexes
CREATE INDEX idx_callbacks_time ON callbacks(requested_time);
CREATE INDEX idx_callbacks_status ON callbacks(status);
```

## Relationships

1. Users create and manage Campaigns
2. Campaigns contain Campaign_Scripts
3. Leads are assigned to Campaigns through Campaign_Leads
4. Calls are made to Campaign_Leads
5. Conversations are recorded for each Call
6. Conversation_Segments break down Conversations
7. Callbacks are scheduled for Leads
8. Knowledge_Base entries are used during Conversations
9. Reports are created by Users
10. Notifications are sent to Users
11. Audit_Logs track all system activities

This schema is designed to support the requirements of the AI cold-calling system while ensuring data integrity, performance, and compliance with Indian regulations.
