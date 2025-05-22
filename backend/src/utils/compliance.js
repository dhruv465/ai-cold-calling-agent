// src/utils/compliance.js
const logger = require('./logger');
const config = require('../config/config');
const { AuditLog } = require('../models');

/**
 * Utility for handling compliance-related operations
 */
class ComplianceUtil {
  /**
   * Check if a phone number is on the DND (Do Not Disturb) registry
   * @param {string} phoneNumber - Phone number to check
   * @returns {Promise<boolean>} - Whether the number is on DND registry
   */
  async checkDndRegistry(phoneNumber) {
    try {
      logger.info(`Checking DND status for ${phoneNumber}`);
      
      // In a production environment, this would call the actual TRAI DND registry API
      // For now, we'll simulate the check with a mock implementation
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // For testing, we'll consider numbers ending with specific digits as DND
      const isDnd = phoneNumber.endsWith('0000') || phoneNumber.endsWith('9999');
      
      // Log the result
      logger.info(`DND status for ${phoneNumber}: ${isDnd ? 'Registered' : 'Not registered'}`);
      
      // Record the check in audit log
      await AuditLog.create({
        action: 'DND_CHECK',
        entity_type: 'phone_number',
        entity_id: phoneNumber,
        details: JSON.stringify({ isDnd }),
        created_by: 'system'
      });
      
      return isDnd;
    } catch (error) {
      logger.error('DND registry check error:', error);
      throw new Error('Failed to check DND registry');
    }
  }

  /**
   * Validate calling hours based on Indian regulations
   * @param {string} phoneNumber - Phone number to call
   * @returns {boolean} - Whether it's allowed to call at current time
   */
  validateCallingHours() {
    try {
      // Get current time in India (IST = UTC+5:30)
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
      const istTime = new Date(now.getTime() + istOffset);
      
      const hours = istTime.getUTCHours();
      const day = istTime.getUTCDay(); // 0 = Sunday, 6 = Saturday
      
      // TRAI regulations: Calls allowed between 9 AM and 9 PM, Monday to Saturday
      const isValidHour = hours >= 9 && hours < 21;
      const isValidDay = day >= 1 && day <= 6; // Monday to Saturday
      
      const isValid = isValidHour && isValidDay;
      
      logger.info(`Calling hours validation: ${isValid ? 'Valid' : 'Invalid'} (${hours}:00 IST, day ${day})`);
      
      return isValid;
    } catch (error) {
      logger.error('Calling hours validation error:', error);
      throw new Error('Failed to validate calling hours');
    }
  }

  /**
   * Generate compliance report for a given time period
   * @param {Date} startDate - Start date for the report
   * @param {Date} endDate - End date for the report
   * @returns {Promise<object>} - Compliance report data
   */
  async generateComplianceReport(startDate, endDate) {
    try {
      logger.info(`Generating compliance report from ${startDate} to ${endDate}`);
      
      // Get all audit logs for the period
      const auditLogs = await AuditLog.findAll({
        where: {
          created_at: {
            [Op.between]: [startDate, endDate]
          }
        }
      });
      
      // Analyze DND compliance
      const dndChecks = auditLogs.filter(log => log.action === 'DND_CHECK');
      const dndCompliance = dndChecks.length > 0 
        ? (dndChecks.filter(log => {
            const details = JSON.parse(log.details);
            return !details.isDnd || (details.isDnd && !details.called);
          }).length / dndChecks.length) * 100
        : 100;
      
      // Analyze calling hours compliance
      const callAttempts = auditLogs.filter(log => log.action === 'CALL_ATTEMPT');
      const hoursCompliance = callAttempts.length > 0
        ? (callAttempts.filter(log => {
            const details = JSON.parse(log.details);
            return details.validHours;
          }).length / callAttempts.length) * 100
        : 100;
      
      // Analyze script compliance
      const scriptUsage = auditLogs.filter(log => log.action === 'SCRIPT_USED');
      const scriptCompliance = scriptUsage.length > 0
        ? (scriptUsage.filter(log => {
            const details = JSON.parse(log.details);
            return details.approved;
          }).length / scriptUsage.length) * 100
        : 100;
      
      // Overall compliance score
      const overallCompliance = (dndCompliance + hoursCompliance + scriptCompliance) / 3;
      
      return {
        period: {
          startDate,
          endDate
        },
        metrics: {
          dndCompliance: Math.round(dndCompliance),
          hoursCompliance: Math.round(hoursCompliance),
          scriptCompliance: Math.round(scriptCompliance),
          overallCompliance: Math.round(overallCompliance)
        },
        details: {
          totalCalls: callAttempts.length,
          dndChecks: dndChecks.length,
          scriptUsage: scriptUsage.length
        }
      };
    } catch (error) {
      logger.error('Compliance report generation error:', error);
      throw new Error('Failed to generate compliance report');
    }
  }

  /**
   * Validate a call script for compliance with regulations
   * @param {string} script - Call script to validate
   * @returns {object} - Validation result
   */
  validateScript(script) {
    try {
      if (!script) {
        return {
          valid: false,
          issues: ['Script is empty']
        };
      }
      
      const issues = [];
      
      // Check for required introduction
      if (!script.includes('company') && !script.includes('organization')) {
        issues.push('Script must include company or organization identification');
      }
      
      // Check for required opt-out information
      if (!script.includes('unsubscribe') && !script.includes('opt out') && !script.includes('stop')) {
        issues.push('Script must include opt-out information');
      }
      
      // Check for prohibited language
      const prohibitedTerms = [
        'guaranteed', 'guarantee', '100%', 'definitely', 'certainly', 'absolutely',
        'free money', 'get rich', 'quick cash', 'easy money'
      ];
      
      for (const term of prohibitedTerms) {
        if (script.toLowerCase().includes(term)) {
          issues.push(`Script contains prohibited term: "${term}"`);
        }
      }
      
      return {
        valid: issues.length === 0,
        issues
      };
    } catch (error) {
      logger.error('Script validation error:', error);
      throw new Error('Failed to validate script');
    }
  }
}

module.exports = new ComplianceUtil();
