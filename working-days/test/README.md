# Working Days Node Tests

This directory contains comprehensive test coverage for the Working Days n8n node.

## Test Structure

```
test/
├── setup.ts                    # Global test setup
├── __tests__/
│   ├── utils/
│   │   ├── date.test.ts       # Tests for date utility functions
│   │   └── workingDays.test.ts # Tests for working days calculations
│   └── nodes/
│       └── WorkingDays.node.test.ts # Integration tests for the node
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Coverage

The test suite provides comprehensive coverage:

- **Unit Tests**: Cover all utility functions including:
  - Date manipulation with Luxon
  - Working days calculations
  - Holiday fetching and processing
  - Date conversions between JS Date and Luxon DateTime

- **Integration Tests**: Test the complete node functionality:
  - Both operations (getStats and calculateRange)
  - All German states
  - Error handling
  - Date conversions in output
  - API mocking

## Key Test Scenarios

### Date Utils Tests
- Timezone handling
- Date range calculations
- Week boundaries
- Leap year support
- ISO formatting

### Working Days Utils Tests
- Holiday filtering
- Working days counting
- Custom working days support
- Multi-year date ranges
- API error handling

### Node Integration Tests
- Complete workflow execution
- Parameter validation
- Error propagation
- Output formatting
- API integration

## Mocking

Tests use Jest mocks to:
- Mock HTTP requests to api-feiertage.de
- Mock n8n workflow helpers
- Provide deterministic test data

## Coverage Thresholds

The project maintains high test coverage standards:
- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%

Current coverage exceeds all thresholds with >98% overall coverage.