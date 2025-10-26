#!/usr/bin/env node

/**
 * Backend Connection Test Script
 * Tests all API endpoints to ensure backend is working correctly
 */

const axios = require('axios');

const BACKEND_URL = 'http://localhost:8080/api/v1';
const HEALTH_CHECK_URL = 'http://localhost:8080/testServer';

// Test data
const testData = {
  notification: {
    title: 'Test Notification',
    message: 'This is a test notification from frontend',
    type: 'system'
  },
  news: {
    title: 'Test News Article',
    content: 'This is a test news article content',
    category: 'test',
    tags: ['test', 'integration']
  },
  template: {
    name: 'Test Template',
    title: 'Test Template Title',
    message: 'This is a test template message',
    type: 'system'
  }
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

async function testHealthCheck() {
  try {
    logInfo('Testing backend health check...');
    const response = await axios.get(HEALTH_CHECK_URL, { timeout: 5000 });
    
    if (response.status === 200) {
      logSuccess('Backend health check passed');
      return true;
    } else {
      logError(`Backend health check failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    logError(`Backend health check failed: ${error.message}`);
    return false;
  }
}

async function testNotificationsAPI() {
  logInfo('Testing Notifications API...');
  
  try {
    // Test stats endpoint
    const statsResponse = await axios.get(`${BACKEND_URL}/notifications/stats`);
    logSuccess('Notifications stats endpoint working');
    
    // Test history endpoint
    const historyResponse = await axios.get(`${BACKEND_URL}/notifications/history?page=1&limit=10`);
    logSuccess('Notifications history endpoint working');
    
    return true;
  } catch (error) {
    logError(`Notifications API failed: ${error.message}`);
    return false;
  }
}

async function testNewsAPI() {
  logInfo('Testing News API...');
  
  try {
    // Test stats endpoint
    const statsResponse = await axios.get(`${BACKEND_URL}/news/stats`);
    logSuccess('News stats endpoint working');
    
    // Test list endpoint
    const listResponse = await axios.get(`${BACKEND_URL}/news?page=1&limit=10`);
    logSuccess('News list endpoint working');
    
    return true;
  } catch (error) {
    logError(`News API failed: ${error.message}`);
    return false;
  }
}

async function testReportsAPI() {
  logInfo('Testing Reports API...');
  
  try {
    // Test stats endpoint
    const statsResponse = await axios.get(`${BACKEND_URL}/reports/stats`);
    logSuccess('Reports stats endpoint working');
    
    // Test list endpoint
    const listResponse = await axios.get(`${BACKEND_URL}/reports?page=1&limit=10`);
    logSuccess('Reports list endpoint working');
    
    return true;
  } catch (error) {
    logError(`Reports API failed: ${error.message}`);
    return false;
  }
}

async function testTemplatesAPI() {
  logInfo('Testing Templates API...');
  
  try {
    // Test stats endpoint
    const statsResponse = await axios.get(`${BACKEND_URL}/templates/stats`);
    logSuccess('Templates stats endpoint working');
    
    // Test list endpoint
    const listResponse = await axios.get(`${BACKEND_URL}/templates?page=1&limit=10`);
    logSuccess('Templates list endpoint working');
    
    return true;
  } catch (error) {
    logError(`Templates API failed: ${error.message}`);
    return false;
  }
}

async function testUsersAPI() {
  logInfo('Testing Users API...');
  
  try {
    // Test stats endpoint
    const statsResponse = await axios.get(`${BACKEND_URL}/users/stats`);
    logSuccess('Users stats endpoint working');
    
    // Test search endpoint
    const searchResponse = await axios.get(`${BACKEND_URL}/users/search?page=1&limit=10`);
    logSuccess('Users search endpoint working');
    
    return true;
  } catch (error) {
    logError(`Users API failed: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  log('🚀 Starting Backend Integration Tests...', 'bold');
  log('=====================================', 'bold');
  
  const results = {
    healthCheck: false,
    notifications: false,
    news: false,
    reports: false,
    templates: false,
    users: false
  };
  
  // Test health check first
  results.healthCheck = await testHealthCheck();
  
  if (!results.healthCheck) {
    logError('Backend is not running. Please start the backend server first.');
    logInfo('Run: npm run dev (in backend directory)');
    process.exit(1);
  }
  
  // Test all API endpoints
  results.notifications = await testNotificationsAPI();
  results.news = await testNewsAPI();
  results.reports = await testReportsAPI();
  results.templates = await testTemplatesAPI();
  results.users = await testUsersAPI();
  
  // Summary
  log('\n📊 Test Results Summary:', 'bold');
  log('======================', 'bold');
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  
  Object.entries(results).forEach(([test, passed]) => {
    if (passed) {
      logSuccess(`${test}: PASSED`);
    } else {
      logError(`${test}: FAILED`);
    }
  });
  
  log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`, 'bold');
  
  if (passedTests === totalTests) {
    logSuccess('🎉 All tests passed! Backend is ready for frontend integration.');
    process.exit(0);
  } else {
    logError('❌ Some tests failed. Please check backend implementation.');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  logError(`Test runner failed: ${error.message}`);
  process.exit(1);
});

