# T-ER Testing Guide

## Running Tests

This project includes both frontend (React/TypeScript) and backend (Django) tests. You can run all tests with a single command:

```bash
npm run test:all
```

This command will:
1. Run all frontend tests using Jest
2. Install necessary Python dependencies
3. Run all backend tests using pytest

## Frontend Tests

Frontend tests use Jest and React Testing Library. You can run them separately with:

```bash
npm test                # Run all frontend tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage report
```

Frontend tests are located in the `src/__tests__` directory and test the following components:
- Cart and wishlist services
- React hooks for cart and wishlist functionality
- UI components like ProductsSection

## Backend Tests

Backend tests use pytest. You can run them separately by navigating to the backend directory and running:

```bash
python -m pytest
```

Backend tests are located in the `backend/tests` directory and test the following functionality:
- Cart API endpoints
- Wishlist API endpoints

## Test Configuration

- Frontend tests are configured in `jest.config.cjs` and `jest.setup.cjs`
- Backend tests are configured in `pytest.ini`

## Troubleshooting

If you encounter issues running the tests:

1. Make sure all dependencies are installed:
   ```bash
   npm install              # Frontend dependencies
   cd backend && python -m pip install -r requirements.txt  # Backend dependencies
   ```

2. Check that the test configuration files are correctly set up

3. For TypeScript errors, ensure the tsconfig.json is properly configured

4. For Python dependency issues, try installing setuptools: `python -m pip install setuptools`