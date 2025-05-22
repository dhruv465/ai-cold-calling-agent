// src/scripts/deploy-aws.js
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const awsConfig = require('../config/aws-deployment');
const logger = require('../utils/logger');

/**
 * Script for deploying the application to AWS
 */

// Configure AWS SDK
AWS.config.update({
  region: awsConfig.aws.region,
  profile: awsConfig.aws.profile
});

// Initialize AWS services
const ec2 = new AWS.EC2();
const rds = new AWS.RDS();
const s3 = new AWS.S3();
const elasticBeanstalk = new AWS.ElasticBeanstalk();
const cloudFront = new AWS.CloudFront();
const cloudWatch = new AWS.CloudWatch();

/**
 * Main deployment function
 */
async function deploy() {
  try {
    logger.info('Starting AWS deployment process...');
    
    // Create S3 bucket for assets
    await createS3Bucket();
    
    // Create RDS database instance
    await createRdsInstance();
    
    // Create Elastic Beanstalk application and environment
    await createElasticBeanstalkApp();
    
    // Create CloudFront distribution
    if (awsConfig.cloudFront.enabled) {
      await createCloudFrontDistribution();
    }
    
    // Set up CloudWatch alarms
    await setupCloudWatchAlarms();
    
    logger.info('AWS deployment completed successfully!');
    
    return {
      success: true,
      message: 'Deployment completed successfully',
      endpoints: {
        api: `http://${awsConfig.elasticBeanstalk.environmentName}.elasticbeanstalk.com`,
        assets: `https://${awsConfig.s3.bucketName}.s3.amazonaws.com`
      }
    };
  } catch (error) {
    logger.error('Deployment failed:', error);
    return {
      success: false,
      message: 'Deployment failed',
      error: error.message
    };
  }
}

/**
 * Create S3 bucket for assets
 */
async function createS3Bucket() {
  try {
    logger.info(`Creating S3 bucket: ${awsConfig.s3.bucketName}`);
    
    // Check if bucket already exists
    try {
      await s3.headBucket({ Bucket: awsConfig.s3.bucketName }).promise();
      logger.info(`S3 bucket ${awsConfig.s3.bucketName} already exists`);
      return;
    } catch (error) {
      if (error.statusCode !== 404) {
        throw error;
      }
    }
    
    // Create bucket
    await s3.createBucket({
      Bucket: awsConfig.s3.bucketName,
      CreateBucketConfiguration: {
        LocationConstraint: awsConfig.aws.region
      }
    }).promise();
    
    // Configure CORS
    await s3.putBucketCors({
      Bucket: awsConfig.s3.bucketName,
      CORSConfiguration: {
        CORSRules: awsConfig.s3.corsRules
      }
    }).promise();
    
    // Configure bucket policy for public read access
    const bucketPolicy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicReadGetObject',
          Effect: 'Allow',
          Principal: '*',
          Action: 's3:GetObject',
          Resource: `arn:aws:s3:::${awsConfig.s3.bucketName}/*`
        }
      ]
    };
    
    await s3.putBucketPolicy({
      Bucket: awsConfig.s3.bucketName,
      Policy: JSON.stringify(bucketPolicy)
    }).promise();
    
    logger.info(`S3 bucket ${awsConfig.s3.bucketName} created successfully`);
  } catch (error) {
    logger.error('Error creating S3 bucket:', error);
    throw error;
  }
}

/**
 * Create RDS database instance
 */
async function createRdsInstance() {
  try {
    const dbInstanceIdentifier = `ai-cold-calling-${awsConfig.rds.dbName}`;
    logger.info(`Creating RDS instance: ${dbInstanceIdentifier}`);
    
    // Check if instance already exists
    try {
      await rds.describeDBInstances({
        DBInstanceIdentifier: dbInstanceIdentifier
      }).promise();
      logger.info(`RDS instance ${dbInstanceIdentifier} already exists`);
      return;
    } catch (error) {
      if (error.code !== 'DBInstanceNotFound') {
        throw error;
      }
    }
    
    // Create DB subnet group
    const subnetGroupName = `ai-cold-calling-subnet-group`;
    try {
      await rds.createDBSubnetGroup({
        DBSubnetGroupName: subnetGroupName,
        DBSubnetGroupDescription: 'Subnet group for AI Cold Calling Agent',
        SubnetIds: [awsConfig.ec2.subnetId] // In production, you would include multiple subnets
      }).promise();
    } catch (error) {
      if (error.code !== 'DBSubnetGroupAlreadyExists') {
        throw error;
      }
    }
    
    // Create DB instance
    await rds.createDBInstance({
      DBInstanceIdentifier: dbInstanceIdentifier,
      DBName: awsConfig.rds.dbName,
      Engine: awsConfig.rds.engine,
      EngineVersion: awsConfig.rds.engineVersion,
      DBInstanceClass: awsConfig.rds.instanceClass,
      AllocatedStorage: awsConfig.rds.allocatedStorage,
      MasterUsername: awsConfig.rds.masterUsername,
      MasterUserPassword: process.env.DB_PASSWORD || 'ChangeMe123!', // Should be set securely
      VpcSecurityGroupIds: awsConfig.ec2.securityGroupIds,
      DBSubnetGroupName: subnetGroupName,
      MultiAZ: awsConfig.rds.multiAZ,
      BackupRetentionPeriod: awsConfig.rds.backupRetentionPeriod,
      DeletionProtection: awsConfig.rds.deletionProtection,
      PubliclyAccessible: false,
      StorageEncrypted: true
    }).promise();
    
    logger.info(`RDS instance ${dbInstanceIdentifier} creation initiated`);
    
    // Wait for the instance to be available
    logger.info('Waiting for RDS instance to be available...');
    await rds.waitFor('dBInstanceAvailable', {
      DBInstanceIdentifier: dbInstanceIdentifier
    }).promise();
    
    logger.info(`RDS instance ${dbInstanceIdentifier} created successfully`);
  } catch (error) {
    logger.error('Error creating RDS instance:', error);
    throw error;
  }
}

/**
 * Create Elastic Beanstalk application and environment
 */
async function createElasticBeanstalkApp() {
  try {
    logger.info(`Creating Elastic Beanstalk application: ${awsConfig.elasticBeanstalk.applicationName}`);
    
    // Check if application already exists
    try {
      await elasticBeanstalk.describeApplications({
        ApplicationNames: [awsConfig.elasticBeanstalk.applicationName]
      }).promise();
      logger.info(`Elastic Beanstalk application ${awsConfig.elasticBeanstalk.applicationName} already exists`);
    } catch (error) {
      // Create application if it doesn't exist
      await elasticBeanstalk.createApplication({
        ApplicationName: awsConfig.elasticBeanstalk.applicationName,
        Description: 'AI Cold Calling Agent Application'
      }).promise();
      logger.info(`Elastic Beanstalk application ${awsConfig.elasticBeanstalk.applicationName} created`);
    }
    
    // Check if environment already exists
    try {
      await elasticBeanstalk.describeEnvironments({
        ApplicationName: awsConfig.elasticBeanstalk.applicationName,
        EnvironmentNames: [awsConfig.elasticBeanstalk.environmentName]
      }).promise();
      logger.info(`Elastic Beanstalk environment ${awsConfig.elasticBeanstalk.environmentName} already exists`);
      return;
    } catch (error) {
      // Continue to create environment
    }
    
    // Package the application
    logger.info('Packaging application for deployment...');
    const appZipPath = path.join(__dirname, '../../dist/app.zip');
    
    // Create dist directory if it doesn't exist
    if (!fs.existsSync(path.join(__dirname, '../../dist'))) {
      fs.mkdirSync(path.join(__dirname, '../../dist'));
    }
    
    // Create zip file
    execSync(`cd ${path.join(__dirname, '../..')} && zip -r ${appZipPath} . -x "node_modules/*" "dist/*" ".git/*"`);
    
    // Upload to S3
    const s3Key = `deployments/app-${Date.now()}.zip`;
    await s3.putObject({
      Bucket: awsConfig.s3.bucketName,
      Key: s3Key,
      Body: fs.readFileSync(appZipPath)
    }).promise();
    
    // Create application version
    const versionLabel = `v${Date.now()}`;
    await elasticBeanstalk.createApplicationVersion({
      ApplicationName: awsConfig.elasticBeanstalk.applicationName,
      VersionLabel: versionLabel,
      SourceBundle: {
        S3Bucket: awsConfig.s3.bucketName,
        S3Key: s3Key
      },
      AutoCreateApplication: false
    }).promise();
    
    // Create environment
    await elasticBeanstalk.createEnvironment({
      ApplicationName: awsConfig.elasticBeanstalk.applicationName,
      EnvironmentName: awsConfig.elasticBeanstalk.environmentName,
      SolutionStackName: awsConfig.elasticBeanstalk.solutionStackName,
      OptionSettings: awsConfig.elasticBeanstalk.optionSettings,
      VersionLabel: versionLabel
    }).promise();
    
    logger.info(`Elastic Beanstalk environment ${awsConfig.elasticBeanstalk.environmentName} creation initiated`);
    
    // Wait for the environment to be ready
    logger.info('Waiting for Elastic Beanstalk environment to be ready...');
    await elasticBeanstalk.waitFor('environmentUpdated', {
      EnvironmentNames: [awsConfig.elasticBeanstalk.environmentName]
    }).promise();
    
    logger.info(`Elastic Beanstalk environment ${awsConfig.elasticBeanstalk.environmentName} created successfully`);
  } catch (error) {
    logger.error('Error creating Elastic Beanstalk application:', error);
    throw error;
  }
}

/**
 * Create CloudFront distribution
 */
async function createCloudFrontDistribution() {
  try {
    logger.info('Creating CloudFront distribution...');
    
    // Check if distribution already exists
    const distributions = await cloudFront.listDistributions().promise();
    const existingDistribution = distributions.DistributionList.Items.find(
      dist => dist.Origins.Items[0].DomainName.includes(awsConfig.s3.bucketName)
    );
    
    if (existingDistribution) {
      logger.info(`CloudFront distribution for ${awsConfig.s3.bucketName} already exists`);
      return;
    }
    
    // Create distribution
    await cloudFront.createDistribution({
      DistributionConfig: {
        CallerReference: `${awsConfig.s3.bucketName}-${Date.now()}`,
        DefaultRootObject: awsConfig.cloudFront.defaultRootObject,
        Origins: {
          Quantity: 1,
          Items: [
            {
              Id: `S3-${awsConfig.s3.bucketName}`,
              DomainName: `${awsConfig.s3.bucketName}.s3.amazonaws.com`,
              S3OriginConfig: {
                OriginAccessIdentity: ''
              }
            }
          ]
        },
        DefaultCacheBehavior: {
          TargetOriginId: `S3-${awsConfig.s3.bucketName}`,
          ForwardedValues: {
            QueryString: false,
            Cookies: {
              Forward: 'none'
            }
          },
          ViewerProtocolPolicy: awsConfig.cloudFront.viewerProtocolPolicy,
          MinTTL: awsConfig.cloudFront.minTTL,
          DefaultTTL: awsConfig.cloudFront.defaultTTL,
          MaxTTL: awsConfig.cloudFront.maxTTL
        },
        Enabled: true,
        PriceClass: awsConfig.cloudFront.priceClass,
        ViewerCertificate: {
          CloudFrontDefaultCertificate: true
        },
        Restrictions: {
          GeoRestriction: {
            RestrictionType: awsConfig.cloudFront.geoRestriction.restrictionType,
            Quantity: awsConfig.cloudFront.geoRestriction.locations.length,
            Items: awsConfig.cloudFront.geoRestriction.locations
          }
        },
        HttpVersion: awsConfig.cloudFront.httpVersion
      }
    }).promise();
    
    logger.info('CloudFront distribution created successfully');
  } catch (error) {
    logger.error('Error creating CloudFront distribution:', error);
    throw error;
  }
}

/**
 * Set up CloudWatch alarms
 */
async function setupCloudWatchAlarms() {
  try {
    logger.info('Setting up CloudWatch alarms...');
    
    for (const alarmConfig of awsConfig.cloudWatch.alarms) {
      // Check if alarm already exists
      try {
        await cloudWatch.describeAlarms({
          AlarmNames: [alarmConfig.name]
        }).promise();
        logger.info(`CloudWatch alarm ${alarmConfig.name} already exists`);
        continue;
      } catch (error) {
        // Continue to create alarm
      }
      
      // Create alarm
      await cloudWatch.putMetricAlarm({
        AlarmName: alarmConfig.name,
        MetricName: alarmConfig.metric,
        Namespace: alarmConfig.namespace,
        Statistic: alarmConfig.statistic,
        Period: alarmConfig.period,
        EvaluationPeriods: alarmConfig.evaluationPeriods,
        Threshold: alarmConfig.threshold,
        ComparisonOperator: alarmConfig.comparisonOperator,
        AlarmActions: alarmConfig.alarmActions
      }).promise();
      
      logger.info(`CloudWatch alarm ${alarmConfig.name} created`);
    }
    
    logger.info('CloudWatch alarms set up successfully');
  } catch (error) {
    logger.error('Error setting up CloudWatch alarms:', error);
    throw error;
  }
}

// Execute deployment if script is run directly
if (require.main === module) {
  deploy()
    .then(result => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Deployment failed:', error);
      process.exit(1);
    });
}

module.exports = { deploy };
