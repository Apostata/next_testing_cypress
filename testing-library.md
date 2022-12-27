# React Testing library
* renderiza, pesquisa e interage com componentes no virtual DOM

## Metodos render e screen
.render - cria o virtual DOM
.screen - tem alguns metodos para procurar no virtual DOM

exemplo:
```js
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />); 
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
```
onde render vai criar o virtual dom e screen vai usar o metodo getByText, para encontrar o elemento a ser testado

## Acessibilidade
* Test por acessibilidade:
  * getByRole
  * getByLabelText
  * getByPlaceholderText
  * getByText
  * getByDisplayValue
* Queries semanticas:
  * getByAltText
  * getByTitle
  * getByTestId (só recomendado quando nenhum dos outros estiver presente, pois não é visivel ou audivel pelo usuário)

### Recomendações de acessibilidade
Caso seja um elemento estático que não tem interação, podemos usar o `getByText`, caso seja um link, ai sim ele terá uma role, então melhor seria `getByRole`

## Queries
### Command
1. **get**, espera que o elemento que esteja no DOM:
   * getByRole, = getByRole('role', {...options}), exemplo
     * expect(htmlHelement)`.getByRole('link', {name: /learn react/i}` - Pega o elemento do tipo link de texto 'learn react', not case sensitive
     * veja : https://www.w3.org/TR/wai-aria/#role_definitions para roles de cada elemento do DOM
2. **query**, espera que o elemento que NÃO está no DOM
3. **find**, espera que o elemento apareça asyncrono

Todos comandos tem a opção `all`, que retorna um array, exemplo: `getAllByRole`

### QueryTypes
* Role (preferivel), exemplos: `getByRole`, `getAllByRole`, `findByRole`, `findAllByRole`, `queryByRole` e `queryAllByrole`
* AltText (images)
* Text (display elements)
* Form elements:
  * PlaceHolderText
  * LabelText
  * DisplayValue

* toHaveStyle, exemplo
  * expect(htmlHelement)`.toHaveStyle({ backgroundColor: 'red' })`

Quick reference: https://testing-library.com/docs/react-testing-library/cheatsheet/

## Events
* fireEvents
* userEvents - recomendado userEvent ao inveás de fireEvent para eventos de ações de usuários

### async events
wait for é usado para teste assincronos para quando o elemento leva um certo tempo para responder
exemplo:
```js
test('Povover appers when mouseover on checkbox label, and disapears when mouseout', async()=>{
    render(<SummaryForm/>)
    const termsAndConditionsPopoverText = screen.getByText(termsAnConditionsText)

    userEvent.hover(termsAndConditionsPopoverText)
    const popover =screen.getByText(popoverText)
    expect(popover).toBeInTheDocument();

    userEvent.unhover(termsAndConditionsPopoverText)
    await waitFor(() => {
        const nullPopover = screen.queryByText(popoverText)
        expect(nullPopover).not.toBeInTheDocument();
    });
})
```

## Moking server responses
### Mock service worker
* Previnir chamadas ao server para retornar resposta mockada
`yarn install msw` ou `npm i msw` 
* References:
  * https://mswjs.io/
  * https://mswjs.io/docs/getting-started/mocks/rest-api
  * https://mswjs.io/docs/getting-started/mocks/graphql-api

#### Criando o server e handlers
criando os handlers, que são os endpoints com as respostas mockadas:

**criando em `src/mocks/handlers.js`:**
```js
import { rest } from "msw";

export const handlers = [
  rest.get("http://localhost:3030/scoops", (req, resp, ctx) => {
    //handler para chamada a /scoops
    return resp(
      ctx.json([
        { name: "chocolate", imagePath: "/images/chocolate.png" },
        { name: "Vanilla", imagePath: "/images/vanillar.png" },
      ])
    );
  }),
  ... // um array de handlers
];

``` 

**configurando o server para mock em `src/mocks/server.js`:
```js
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);

```
**Integrando com os testes:**
neste link a a integração com o CRA (creat react app e manualmente, para quem não usa CRA)
https://mswjs.io/docs/getting-started/integrate/node

##### With CRA
adicionar a configuração abaixo ao arquivo `src/setupTests.js`: 
```js
// src/setupTests.js
import { server } from './mocks/server.js'
// Establish API mocking before all tests.
beforeAll(() => server.listen())

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers())

// Clean up after the tests are finished.
afterAll(() => server.close())
```

##### Without CRA
criar o arquivo `jest.setup.js` caso não estja criado na raiz do projeto

referencie o arquivo acima no `jes.config.js`, ou crie-o caso ainda não exista:
```js
module.exports = {
  setupFilesAfterEnv: ['./jest.setup.js'],
}
``` 

#### Sobescrevendo configurações iniciais para tratamento de erros no server

Na confiruração do MSW configuramos para as respostas de status 200, mas para tratar os erros precisamos sobrescrever nos teste
```js
import { render , screen, waitFor } from '@testing-library/react'
import OrderEntry from '../OrderEntry'
import { rest } from 'msw'
import { server } from '../../../mocks/server'

const errorText = 'An unexpected error ocurred. Please try again later'
// const error500Text = new RegExp(errorText, 'i')

describe('Order entry', ()=>{
    describe('Ininital render', ()=>{
        test.only('handle errors for scoops and toppings backend routes', async ()=>{
            server.resetHandlers(
                rest.get('http://localhost:3030/scoops', (req, res, ctx)=>{
                    return res(
                        ctx.status(500),
                        ctx.json({
                            errorMessage: errorText,
                        }),
                    )
                }),
                rest.get('http://localhost:3030/toppings', (req, res, ctx)=>{
                    return res(
                        ctx.status(500),
                        ctx.json({
                            errorMessage: errorText,
                        }),
                    )
                })
            )

            render(<OrderEntry/>)
            await waitFor( async ()=> {
                const alerts = await screen.findAllByRole('alert')
                expect(alerts).toHaveLength(2)
            })
        })
    })
})
```
**NOTA: como são duas chamadas, uma em cada endpoint, precisamos usar o metoto `waitFor` para que o teste só ocorra após ambas chamadas, no caso acima esperamos até que apareçam dois alerts no DOM**

## Colocarndo wrappers para contexto ou rotas

Para contextos basta ou colocar no código do componente ou usar:
```jsx
import { render, screen } from '@testing-library/react'
import { OrderDetailsProvider } from '../../../Providers/OrderDetails.provider'
import { ScoopsAndToppingsProvider } from '../../../Providers/scoopsAndToppings.provider'

// import Options from '../Options-bonnie'
import {Options} from '../Options'

const WhithAllProviders = ({children})=>{
    return(
        <OrderDetailsProvider>
            <ScoopsAndToppingsProvider>
                {children}
            </ScoopsAndToppingsProvider>
        </OrderDetailsProvider>
    )
}


describe('Options initial render', ()=>{
    test('Displays image for each scoop option from the server', async ()=>{
        render(<Options optionsType="scoops" />, {wrapper: WhithAllProviders })
        
        const scoopImages = await screen.findAllByRole('img', {name:/scoop$/i})
        expect(scoopImages).toHaveLength(2)
        const altTexts = scoopImages.map(img=>img.alt)
        expect(altTexts).toEqual(['Chocolate scoop', 'Vanilla scoop'])
    })
})
```

ou criar um test-utils para subistituir o render pelo render customizado
```jsx
import { render } from "@testing-library/react";
import { OrderDetailsProvider } from "../Providers/OrderDetails.provider";
import { ScoopsAndToppingsProvider } from "../Providers/scoopsAndToppings.provider";

const WithAllProviders = ({children})=>{
    return (
        <OrderDetailsProvider>
            <ScoopsAndToppingsProvider>
                {children}
            </ScoopsAndToppingsProvider>
        </OrderDetailsProvider>
    )
}

const renderWithContexts = (ui, options) =>{
    return render(ui, {wrapper:WithAllProviders, ...options})
}

export * from '@testing-library/react'
export { renderWithContexts as render}
```

então:

```jsx
import { render , screen} from '../../../test-utils/testing-library-utils'
import { OrderDetailsProvider } from '../../../Providers/OrderDetails.provider'
import { ScoopsAndToppingsProvider } from '../../../Providers/scoopsAndToppings.provider'

// import Options from '../Options-bonnie'
import {Options} from '../Options'

describe('Options initial render', ()=>{
    test('Displays image for each scoop option from the server', async ()=>{
        render(<Options optionsType="scoops" />)
        
        const scoopImages = await screen.findAllByRole('img', {name:/scoop$/i})
        expect(scoopImages).toHaveLength(2)
        const altTexts = scoopImages.map(img=>img.alt)
        expect(altTexts).toEqual(['Chocolate scoop', 'Vanilla scoop'])
    })
})
```

## Match parcial
no exmeplo abaixo pega apenas parte do texto:

```js
describe('scoops subtotal', ()=>{
    test('update scoops subtotal when scoops change', async()=>{
        render(<Options optionsType="scoops" />, {wrapper:WhithAllProviders})
        //  initial subtotal
        const scoopsSubtotal = screen.getByText('Scoops total: $', {exact:false}) //partial match
        expect(scoopsSubtotal).toHaveTextContent('0.00')

        ...
    })
})
```

## Bebugging hits
* screen.debug()
* para assíncrono : findBy...(), getBy...() para síncrono e queryBy...() para quando não existir mais o DOM
  
### Erros comuns e soluções
1. Erro: `unable to find role="{role}"`
  * Solução: "Ou o elemento com este Role não exsiste, ou este role com possível name matcher não existe"
2. Erro: `An update to component inside a test as not wrapped in a act(...)`
   * Solução: "Provavelmente tem um update no componente depois do test ter terminado. use await e findBy...()"
3. Erro: `Can't perform a React state update on an unmounted component. This is a no-op but indicates a memory leek in your application.`
   * Solução: "Provavelmente tem um update no componente depois do test ter terminado. use await e findBy...()"
4. Erro: `connect ECONNREFUSED 127.0.0.1`
   * Solução: "Provavelmente ou não há um mock para o endpoint chamado ou seu método está errado, exemplo: chamando um POST mas o handler esta como GET"

### Preventing default

```js
    const submitOrderButton = screen.getByRole('button', {name:/submit order/i})
    const submitEvent = createEvent.click(submitOrderButton)
    submitEvent.preventDefault = jest.mock()
    userEvent.click(submitOrderButton, submitEvent)
```

### Testando com rotas
em caso de teste com rotas e navegação par outra rota é necessário aguardar até que todas chamadas assincronas sejam feitas para poder testar