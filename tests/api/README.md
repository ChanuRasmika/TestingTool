# API Testing Suite

Comprehensive API testing for authentication and profile endpoints using Playwright.

## Test Structure

### 🔐 Authentication Tests (`auth.api.spec.js`)
- **POST /signup**: User registration with validation, security, and edge cases
- **POST /login**: Authentication with various credential scenarios  
- **GET /profile**: Profile access with token validation
- **Security**: SQL injection, rate limiting, data sanitization

### 👤 Profile Tests (`profile.api.spec.js`)
- **GET /api/profile**: Profile retrieval with authentication
- **PUT /api/profile**: Profile updates with validation
- **File Upload**: Profile picture handling and validation
- **Concurrent Updates**: Race condition testing
- **Data Persistence**: Cross-request data integrity

### 🌐 Network Tests (`network.api.spec.js`)
- **Network Resilience**: Timeouts, connection failures, DNS issues
- **Performance**: Response time validation and concurrent load
- **Payload Limits**: Large data handling and size restrictions
- **HTTP Protocol**: Methods, headers, CORS handling
- **Rate Limiting**: Abuse prevention testing

### 🔄 Integration Tests (`integration.api.spec.js`)
- **Full User Journey**: Complete signup → login → profile workflow
- **Cross-Endpoint Consistency**: Data consistency across endpoints
- **Token Lifecycle**: Multi-request token usage and management
- **Error Propagation**: Cascading failure handling
- **Concurrent Users**: Multi-user simultaneous operations

## Running Tests

### Prerequisites
```bash
# Ensure backend server is running
cd ../backend
npm run dev
```

### Run All API Tests
```bash
cd tests
npx playwright test --config=api/api.config.js
```

### Run Specific Test Suites
```bash
# Authentication tests only
npx playwright test auth.api.spec.js --config=api/api.config.js

# Profile tests only  
npx playwright test profile.api.spec.js --config=api/api.config.js

# Network tests only
npx playwright test network.api.spec.js --config=api/api.config.js

# Integration tests only
npx playwright test integration.api.spec.js --config=api/api.config.js
```

### Debug Mode
```bash
npx playwright test --config=api/api.config.js --debug
```

### Generate Report
```bash
npx playwright show-report ../playwright-report/api
```

## Test Coverage

### ✅ Happy Path Scenarios
- Successful user registration and login
- Valid profile operations and updates
- Proper authentication flow
- File upload functionality

### ❌ Error Scenarios  
- Invalid credentials and malformed data
- Missing authentication tokens
- Validation failures and constraints
- Network timeouts and connection issues

### 🛡️ Security Testing
- SQL injection attempts
- XSS payload handling  
- Rate limiting enforcement
- Token validation and expiration
- Input sanitization

### ⚡ Performance Testing
- Response time validation
- Concurrent request handling
- Large payload processing
- Connection management

### 🔄 Integration Testing
- End-to-end user workflows
- Cross-endpoint data consistency
- Multi-user concurrent operations
- Error recovery and resilience

## Configuration

The API tests use a dedicated configuration (`api.config.js`) with:
- Sequential execution to prevent database conflicts
- Single worker to avoid race conditions
- Backend server auto-start
- Comprehensive reporting
- Proper timeout settings

## Best Practices

1. **Test Isolation**: Each test creates unique test data
2. **Cleanup**: Tests clean up after themselves
3. **Realistic Data**: Uses valid test data patterns
4. **Error Handling**: Comprehensive error scenario coverage
5. **Security Focus**: Includes security vulnerability testing
6. **Performance Aware**: Validates response times and load handling