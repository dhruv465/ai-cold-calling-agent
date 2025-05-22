// src/migrations/20250521_initial_migration.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Users table
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('admin', 'manager', 'agent'),
        defaultValue: 'agent'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      last_login: {
        type: Sequelize.DATE
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Leads table
    await queryInterface.createTable('Leads', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false
      },
      phone_number: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lead_source: {
        type: Sequelize.STRING
      },
      language_preference: {
        type: Sequelize.STRING,
        defaultValue: 'english'
      },
      status: {
        type: Sequelize.ENUM('new', 'contacted', 'qualified', 'converted', 'rejected'),
        defaultValue: 'new'
      },
      dnd_status: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      dnd_checked_at: {
        type: Sequelize.DATE
      },
      notes: {
        type: Sequelize.TEXT
      },
      created_by: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Campaigns table
    await queryInterface.createTable('Campaigns', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT
      },
      goal: {
        type: Sequelize.STRING,
        allowNull: false
      },
      target_audience: {
        type: Sequelize.TEXT
      },
      start_date: {
        type: Sequelize.DATE
      },
      end_date: {
        type: Sequelize.DATE
      },
      status: {
        type: Sequelize.ENUM('draft', 'active', 'paused', 'completed'),
        defaultValue: 'draft'
      },
      created_by: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      default_language: {
        type: Sequelize.STRING,
        defaultValue: 'english'
      },
      call_limit_per_day: {
        type: Sequelize.INTEGER,
        defaultValue: 100
      },
      call_time_start: {
        type: Sequelize.TIME,
        defaultValue: '09:00:00'
      },
      call_time_end: {
        type: Sequelize.TIME,
        defaultValue: '18:00:00'
      },
      retry_attempts: {
        type: Sequelize.INTEGER,
        defaultValue: 3
      },
      retry_interval_minutes: {
        type: Sequelize.INTEGER,
        defaultValue: 60
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // CampaignScripts table
    await queryInterface.createTable('CampaignScripts', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      campaign_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Campaigns',
          key: 'id'
        }
      },
      language: {
        type: Sequelize.STRING,
        defaultValue: 'english'
      },
      script_type: {
        type: Sequelize.ENUM('introduction', 'pitch', 'objection_handling', 'closing', 'callback'),
        defaultValue: 'introduction'
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_by: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      version: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // CampaignLeads table
    await queryInterface.createTable('CampaignLeads', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      campaign_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Campaigns',
          key: 'id'
        }
      },
      lead_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Leads',
          key: 'id'
        }
      },
      status: {
        type: Sequelize.ENUM('pending', 'in_progress', 'completed', 'failed', 'scheduled'),
        defaultValue: 'pending'
      },
      priority: {
        type: Sequelize.INTEGER,
        defaultValue: 5
      },
      scheduled_time: {
        type: Sequelize.DATE
      },
      attempts: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      last_attempt: {
        type: Sequelize.DATE
      },
      next_attempt: {
        type: Sequelize.DATE
      },
      notes: {
        type: Sequelize.TEXT
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Calls table
    await queryInterface.createTable('Calls', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      campaign_lead_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'CampaignLeads',
          key: 'id'
        }
      },
      twilio_call_sid: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.ENUM('initiated', 'in-progress', 'completed', 'failed', 'no-answer'),
        defaultValue: 'initiated'
      },
      start_time: {
        type: Sequelize.DATE
      },
      end_time: {
        type: Sequelize.DATE
      },
      duration: {
        type: Sequelize.INTEGER
      },
      recording_url: {
        type: Sequelize.STRING
      },
      outcome: {
        type: Sequelize.ENUM('interested', 'not-interested', 'callback', 'disconnected', 'other'),
        allowNull: true
      },
      agent_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        },
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create remaining tables...
    // (Conversations, ConversationSegments, Callbacks, KnowledgeBase, Reports, Notifications, AuditLogs)
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables in reverse order to avoid foreign key constraints
    await queryInterface.dropTable('AuditLogs');
    await queryInterface.dropTable('Notifications');
    await queryInterface.dropTable('Reports');
    await queryInterface.dropTable('KnowledgeBase');
    await queryInterface.dropTable('Callbacks');
    await queryInterface.dropTable('ConversationSegments');
    await queryInterface.dropTable('Conversations');
    await queryInterface.dropTable('Calls');
    await queryInterface.dropTable('CampaignLeads');
    await queryInterface.dropTable('CampaignScripts');
    await queryInterface.dropTable('Campaigns');
    await queryInterface.dropTable('Leads');
    await queryInterface.dropTable('Users');
  }
};
