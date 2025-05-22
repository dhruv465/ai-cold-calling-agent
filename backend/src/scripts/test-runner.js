// src/scripts/test-runner.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

/**
 * Script for running automated tests
 */

// Test configurations
const testConfig = {
  unit: {
    backend: 'jest --config=jest.config.js',
    frontend: 'cd ../../frontend && npm test -- --watchAll=false'
  },
  integration: {
    backend: 'jest --config=jest.integration.config.js',
    api: 'newman run ../tests/postman/ai-cold-calling-api.postman_collection.json -e ../tests/postman/local.postman_environment.json'
  },
  e2e: {
    ui: 'cd ../../frontend && npm run test:e2e',
    workflow: 'jest --config=jest.e2e.config.js'
  },
  security: {
    scan: 'zap-cli quick-scan --self-contained --start-options "-config api.disablekey=true" http://localhost:5000',
    audit: 'npm audit --json > ../reports/npm-audit-report.json'
  },
  compliance: {
    check: 'node ../tests/compliance/run-compliance-checks.js'
  }
};

/**
 * Run a specific test suite
 * @param {string} suite - Test suite to run
 * @param {string} type - Test type within the suite
 * @returns {object} - Test results
 */
function runTest(suite, type) {
  try {
    if (!testConfig[suite] || !testConfig[suite][type]) {
      throw new Error(`Invalid test suite or type: ${suite}.${type}`);
    }
    
    const command = testConfig[suite][type];
    logger.info(`Running ${suite}.${type} tests: ${command}`);
    
    const output = execSync(command, { 
      cwd: __dirname,
      stdio: 'pipe',
      encoding: 'utf-8'
    });
    
    // Create reports directory if it doesn't exist
    const reportsDir = path.join(__dirname, '../reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    // Save test results
    const reportPath = path.join(reportsDir, `${suite}-${type}-report.txt`);
    fs.writeFileSync(reportPath, output);
    
    logger.info(`${suite}.${type} tests completed successfully. Report saved to ${reportPath}`);
    
    return {
      success: true,
      output,
      reportPath
    };
  } catch (error) {
    logger.error(`${suite}.${type} tests failed:`, error);
    
    // Save error output
    const reportsDir = path.join(__dirname, '../reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const errorPath = path.join(reportsDir, `${suite}-${type}-error.txt`);
    fs.writeFileSync(errorPath, error.stdout || error.message);
    
    return {
      success: false,
      error: error.message,
      output: error.stdout,
      errorPath
    };
  }
}

/**
 * Run all tests
 * @returns {object} - Test results summary
 */
function runAllTests() {
  const results = {
    unit: {},
    integration: {},
    e2e: {},
    security: {},
    compliance: {}
  };
  
  logger.info('Starting test suite execution...');
  
  // Run unit tests
  for (const type in testConfig.unit) {
    results.unit[type] = runTest('unit', type);
  }
  
  // Run integration tests
  for (const type in testConfig.integration) {
    results.integration[type] = runTest('integration', type);
  }
  
  // Run end-to-end tests
  for (const type in testConfig.e2e) {
    results.e2e[type] = runTest('e2e', type);
  }
  
  // Run security tests
  for (const type in testConfig.security) {
    results.security[type] = runTest('security', type);
  }
  
  // Run compliance tests
  for (const type in testConfig.compliance) {
    results.compliance[type] = runTest('compliance', type);
  }
  
  // Generate summary
  const summary = {
    totalTests: 0,
    passed: 0,
    failed: 0,
    details: {}
  };
  
  for (const suite in results) {
    summary.details[suite] = {
      total: Object.keys(results[suite]).length,
      passed: 0,
      failed: 0
    };
    
    for (const type in results[suite]) {
      summary.totalTests++;
      
      if (results[suite][type].success) {
        summary.passed++;
        summary.details[suite].passed++;
      } else {
        summary.failed++;
        summary.details[suite].failed++;
      }
    }
  }
  
  // Save summary report
  const summaryPath = path.join(__dirname, '../reports/test-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  
  logger.info(`Test suite execution completed. Summary: ${summary.passed}/${summary.totalTests} tests passed.`);
  
  return {
    summary,
    results,
    summaryPath
  };
}

// Execute tests if script is run directly
if (require.main === module) {
  const results = runAllTests();
  console.log(JSON.stringify(results.summary, null, 2));
  process.exit(results.summary.failed > 0 ? 1 : 0);
}

module.exports = {
  runTest,
  runAllTests
};
