// src/models/index.js
const User = require('./User');
const Lead = require('./Lead');
const Campaign = require('./Campaign');
const CampaignScript = require('./CampaignScript');
const CampaignLead = require('./CampaignLead');
const Call = require('./Call');
const Conversation = require('./Conversation');
const ConversationSegment = require('./ConversationSegment');
const Callback = require('./Callback');
const KnowledgeBase = require('./KnowledgeBase');
const Report = require('./Report');
const Notification = require('./Notification');
const AuditLog = require('./AuditLog');

// Define associations
User.hasMany(Lead, { foreignKey: 'created_by' });
Lead.belongsTo(User, { foreignKey: 'created_by', as: 'Creator' });

User.hasMany(Campaign, { foreignKey: 'created_by' });
Campaign.belongsTo(User, { foreignKey: 'created_by', as: 'Creator' });

Campaign.hasMany(CampaignScript, { foreignKey: 'campaign_id' });
CampaignScript.belongsTo(Campaign, { foreignKey: 'campaign_id' });

User.hasMany(CampaignScript, { foreignKey: 'created_by' });
CampaignScript.belongsTo(User, { foreignKey: 'created_by', as: 'Creator' });

Campaign.belongsToMany(Lead, { through: CampaignLead, foreignKey: 'campaign_id' });
Lead.belongsToMany(Campaign, { through: CampaignLead, foreignKey: 'lead_id' });

CampaignLead.belongsTo(Campaign, { foreignKey: 'campaign_id' });
CampaignLead.belongsTo(Lead, { foreignKey: 'lead_id' });
Campaign.hasMany(CampaignLead, { foreignKey: 'campaign_id' });
Lead.hasMany(CampaignLead, { foreignKey: 'lead_id' });

CampaignLead.hasMany(Call, { foreignKey: 'campaign_lead_id' });
Call.belongsTo(CampaignLead, { foreignKey: 'campaign_lead_id' });

User.hasMany(Call, { foreignKey: 'agent_id' });
Call.belongsTo(User, { foreignKey: 'agent_id', as: 'Agent' });

Call.hasOne(Conversation, { foreignKey: 'call_id' });
Conversation.belongsTo(Call, { foreignKey: 'call_id' });

Conversation.hasMany(ConversationSegment, { foreignKey: 'conversation_id' });
ConversationSegment.belongsTo(Conversation, { foreignKey: 'conversation_id' });

Call.hasMany(Callback, { foreignKey: 'call_id' });
Callback.belongsTo(Call, { foreignKey: 'call_id' });

Lead.hasMany(Callback, { foreignKey: 'lead_id' });
Callback.belongsTo(Lead, { foreignKey: 'lead_id' });

Campaign.hasMany(Callback, { foreignKey: 'campaign_id' });
Callback.belongsTo(Campaign, { foreignKey: 'campaign_id' });

User.hasMany(Callback, { foreignKey: 'created_by' });
Callback.belongsTo(User, { foreignKey: 'created_by', as: 'Creator' });

User.hasMany(Callback, { foreignKey: 'assigned_to' });
Callback.belongsTo(User, { foreignKey: 'assigned_to', as: 'Assignee' });

Campaign.hasMany(KnowledgeBase, { foreignKey: 'campaign_id' });
KnowledgeBase.belongsTo(Campaign, { foreignKey: 'campaign_id' });

User.hasMany(KnowledgeBase, { foreignKey: 'created_by' });
KnowledgeBase.belongsTo(User, { foreignKey: 'created_by', as: 'Creator' });

User.hasMany(Report, { foreignKey: 'created_by' });
Report.belongsTo(User, { foreignKey: 'created_by', as: 'Creator' });

User.hasMany(Notification, { foreignKey: 'user_id' });
Notification.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(AuditLog, { foreignKey: 'user_id' });
AuditLog.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
  User,
  Lead,
  Campaign,
  CampaignScript,
  CampaignLead,
  Call,
  Conversation,
  ConversationSegment,
  Callback,
  KnowledgeBase,
  Report,
  Notification,
  AuditLog
};
