// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom/extend-expect";

// polyfill For JSDOM tests
import {TextEncoder, TextDecoder} from 'util'

// Mock service Worker
import {server} from './__tests__/__mocks__/msw/server'

import {resetDB} from './__tests__/__mocks__/db/utils/reset-db'

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// interceptando chamadas a apis antes de qualquer teste
beforeAll(()=>server.listen());

// antes de cada teste reseta o banco de dados
beforeEach(async()=>{
	await resetDB();
});

// reseta os handlers antes depois de executar cada teste
afterEach(()=>server.resetHandlers());

// limpa e encerra o MSW após todos os teste
afterAll(()=>server.close());

