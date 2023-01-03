# Jest parallel testing
Segundo instrutor, pode haver erros ao rodar o comando `yarn test:ci` ou `npm run test:ci`, aparentemente pq os testes rodam em paralelo, e alterando o mesmo DB. Não tive esse erro, mas caso ocorra vai 2 soluções:

1. no arquivo `jest.config.js`, colocar o parametro `maxWorkers` para 1:
```js
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  // to prevent non-test files from being interpreted as test files
  testRegex: "/__tests__/.*\\.test\\.[jt]sx?$",
  moduleNameMapper: {
    // Handle module aliases (this will be automatically configured for you soon)
    "^@/(.*)$": "<rootDir>/$1",
  },
  testEnvironment: "jest-environment-jsdom",
  watchPathIgnorePatterns:["<rootDir>/__tests__/__mocks__/db/.*\\.json"],
  maxWorkers:1
};

```

2. Trabalhar com multiplos arquivos `jest.config.js` criando uma configuração para cada tipo, exemplo de comando no `package.json`:

`"test:ui": "jest --maxWorkers=2 --ci -c ./src/__tests__/ui/jest.config.js",`
