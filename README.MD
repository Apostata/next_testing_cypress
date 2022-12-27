# Next testing e Cypress

## Iniciando
 Criando a aplicação: `npx create-next-app@latest --example with-jest {NOME_DO_APP}` 
 Criando a aplicação com typescript: `npx create-next-app@latest --typescript --example with-jest {NOME_DO_APP}` 

 ### paths

 `@` se refere a pasta raiz do projeto
 Paths para os arquivos dos projetos são definidos em `tsconfig.json`:
 ```json
 {
  "compilerOptions": {
    ...
    "paths": {
      "@/components/*": ["components/*"],
      "@/pages/*": ["pages/*"],
      "@/styles/*": ["styles/*"]
    }
	...
  },
  ...
}
```
já para os testes, são definidos no arquivo `jest.config.js`:
```js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    // Handle module aliases (this will be automatically configured for you soon)
    '^@/components/(.*)$': '<rootDir>/components/$1',

    '^@/pages/(.*)$': '<rootDir>/pages/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
```
### testes
Nos arquivos de testes teremos o seguinte modelo:
```tsx
import { render, screen } from '@testing-library/react'
import Home from '@/pages/index'

describe('Home', () => {
  it('renders a heading', () => {
    render(<Home />)

    const heading = screen.getByRole('heading', {
      name: /welcome to next\.js!/i,
    })

    expect(heading).toBeInTheDocument()
  })
})
```
onde `render` é responsável por simular o render do componente enquannto `screen` é usada para a pesquisa de "DOM" dos elementos renderizados.

**Não irei testar Snapshots**

## O que testar no next
1. no data
2. SSG
3. SSR
4. ISR
5. CSR
   
### Static Page (no data)
Não usa dados do banco, serve apenas conteúdos estáticos

### SSG (Static Site Generation)
Usa dados do banco quando o app é buildado e não atualiza os dados depois, exemplo é uma página de um produto específico

### SSR (Server Side Rendering)
Builda páginas quando requisitadas, envia dados HTML para o cliente
Paginas com conteúdos dinâmicos
Recomendaria usar em uma página que muda frequentemente e por ventura necessita de SEO, mas dê preferencia para ISR, caso não precise de SEO usar o CSR

### ISR (Incremental Static Regeneration)
A página é gerada estáticamente e fica em cache no server porém a cada X tempos é pode ser atualizada conforme a demanda.
Quando precisa de SEO e os dados da página são dinâmicos
 
### CSR (Client Side Rendering)
Quando não precisamos de SEO, mas o conteúdo muda com frequência, usaremos React-Query ao invés do SWR


