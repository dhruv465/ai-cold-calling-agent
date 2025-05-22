// src/config/aws-deployment.js
const config = require('./config');

/**
 * AWS deployment configuration
 */
module.exports = {
  // AWS general configuration
  aws: {
    region: process.env.AWS_REGION || 'ap-south-1', // Mumbai region for India
    profile: process.env.AWS_PROFILE || 'default'
  },
  
  // EC2 configuration
  ec2: {
    instanceType: 't3.medium', // 2 vCPU, 4 GiB memory
    amiId: process.env.AWS_AMI_ID || 'ami-0c55b159cbfafe1f0', // Amazon Linux 2
    keyName: process.env.AWS_KEY_NAME,
    securityGroupIds: process.env.AWS_SECURITY_GROUP_IDS ? process.env.AWS_SECURITY_GROUP_IDS.split(',') : [],
    subnetId: process.env.AWS_SUBNET_ID,
    tags: [
      { Key: 'Name', Value: 'ai-cold-calling-agent' },
      { Key: 'Environment', Value: process.env.NODE_ENV || 'production' },
      { Key: 'Project', Value: 'AI Cold Calling Agent' }
    ]
  },
  
  // RDS configuration
  rds: {
    instanceClass: 'db.t3.small',
    engine: 'mysql',
    engineVersion: '8.0',
    allocatedStorage: 20, // GB
    dbName: config.database.name,
    masterUsername: config.database.username,
    multiAZ: process.env.NODE_ENV === 'production', // Multi-AZ for production only
    backupRetentionPeriod: 7, // days
    deletionProtection: process.env.NODE_ENV === 'production'
  },
  
  // S3 configuration
  s3: {
    bucketName: process.env.AWS_S3_BUCKET || 'ai-cold-calling-agent-assets',
    corsRules: [
      {
        AllowedHeaders: ['*'],
        AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE'],
        AllowedOrigins: config.app.allowedOrigins ? config.app.allowedOrigins.split(',') : ['*'],
        ExposeHeaders: ['ETag', 'Content-Length'],
        MaxAgeSeconds: 3000
      }
    ]
  },
  
  // Elastic Beanstalk configuration
  elasticBeanstalk: {
    applicationName: 'ai-cold-calling-agent',
    environmentName: `ai-cold-calling-agent-${process.env.NODE_ENV || 'production'}`,
    solutionStackName: '64bit Amazon Linux 2 v5.5.0 running Node.js 16',
    optionSettings: [
      {
        Namespace: 'aws:autoscaling:launchconfiguration',
        OptionName: 'InstanceType',
        Value: 't3.medium'
      },
      {
        Namespace: 'aws:autoscaling:asg',
        OptionName: 'MinSize',
        Value: '1'
      },
      {
        Namespace: 'aws:autoscaling:asg',
        OptionName: 'MaxSize',
        Value: '3'
      },
      {
        Namespace: 'aws:elasticbeanstalk:environment',
        OptionName: 'EnvironmentType',
        Value: 'LoadBalanced'
      },
      {
        Namespace: 'aws:elasticbeanstalk:application:environment',
        OptionName: 'NODE_ENV',
        Value: process.env.NODE_ENV || 'production'
      }
    ]
  },
  
  // CloudFront configuration
  cloudFront: {
    enabled: true,
    priceClass: 'PriceClass_200', // Best for Asia, Europe, and North America
    defaultRootObject: 'index.html',
    httpVersion: 'http2',
    viewerProtocolPolicy: 'redirect-to-https',
    minTTL: 0,
    defaultTTL: 86400, // 1 day
    maxTTL: 31536000, // 1 year
    geoRestriction: {
      restrictionType: 'whitelist',
      locations: ['IN'] // Restrict to India only
    }
  },
  
  // CloudWatch configuration
  cloudWatch: {
    alarms: [
      {
        name: 'HighCPUUtilization',
        metric: 'CPUUtilization',
        namespace: 'AWS/EC2',
        statistic: 'Average',
        period: 300, // 5 minutes
        evaluationPeriods: 2,
        threshold: 80,
        comparisonOperator: 'GreaterThanThreshold',
        alarmActions: process.env.AWS_SNS_TOPIC_ARN ? [process.env.AWS_SNS_TOPIC_ARN] : []
      },
      {
        name: 'HighDatabaseCPUUtilization',
        metric: 'CPUUtilization',
        namespace: 'AWS/RDS',
        statistic: 'Average',
        period: 300, // 5 minutes
        evaluationPeriods: 2,
        threshold: 80,
        comparisonOperator: 'GreaterThanThreshold',
        alarmActions: process.env.AWS_SNS_TOPIC_ARN ? [process.env.AWS_SNS_TOPIC_ARN] : []
      }
    ]
  }
};
