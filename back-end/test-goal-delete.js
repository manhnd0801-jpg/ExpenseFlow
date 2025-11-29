const http = require('http');

// Test DELETE goal API
async function testDeleteGoal() {
  console.log('🚀 Testing Goal DELETE API...');

  // Step 1: Login to get token
  const loginData = JSON.stringify({
    email: 'test@expenseflow.com',
    password: 'Test123456',
  });

  const loginOptions = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData),
    },
  };

  const token = await new Promise((resolve, reject) => {
    const req = http.request(loginOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('✅ Login successful');
          resolve(response.data.accessToken);
        } catch (e) {
          console.log('❌ Login failed:', data);
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(loginData);
    req.end();
  });

  // Step 2: Test DELETE goal
  const deleteOptions = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/goals/9423fe5e-8f70-480d-a97d-fc485fd231a3',
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  console.log('🔵 Sending DELETE request...');

  return new Promise((resolve, reject) => {
    const req = http.request(deleteOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        console.log(`📊 Status: ${res.statusCode}`);
        console.log(`📝 Response: ${data}`);

        if (res.statusCode === 500) {
          console.log('🔴 SERVER ERROR - 500 detected');
        } else if (res.statusCode === 204) {
          console.log('🟢 SUCCESS - Goal deleted');
        }

        resolve({ statusCode: res.statusCode, data });
      });
    });

    req.on('error', (error) => {
      console.log('❌ Request failed:', error.message);
      reject(error);
    });

    req.end();
  });
}

// Check if server is running
const healthCheck = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/v1/health',
  method: 'GET',
};

const healthReq = http
  .request(healthCheck, (res) => {
    if (res.statusCode === 200) {
      console.log('✅ Server is running on port 3001');
      testDeleteGoal().catch(console.error);
    } else {
      console.log('❌ Server health check failed:', res.statusCode);
    }
  })
  .on('error', (error) => {
    console.log('❌ Server is not running:', error.message);
    console.log('Please start the backend first: npm run start:dev');
  });

healthReq.end();
