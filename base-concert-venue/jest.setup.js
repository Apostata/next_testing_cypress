// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom/extend-expect";

// Mock service Worker
import {server} from './__tests__/__mocks__/msw/server'

// interceptando chamadas a apis antes de qualquer teste
beforeAll(()=>server.listen());

// reseta os handlers antes depois de executar cada teste
afterEach(()=>server.resetHandlers());

// limpa e encerra o MSW após todos os teste
afterAll(()=>server.close());

