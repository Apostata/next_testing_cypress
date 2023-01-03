# Testing
 ## testing library remember
 ### Queries
 #### Command
1. **get**, espera que o elemento esteja no DOM:
   * getByRole, = getByRole('role', {...options}), exemplo
   * expect(htmlHelement)`.getByRole('link', {name: /learn react/i}` - Pega o elemento do tipo link de texto 'learn react', not case sensitive
   * veja : https://www.w3.org/TR/wai-aria/#role_definitions para roles de cada elemento do DOM
2. **query**, espera que o elemento que NÃO esteja no DOM
3. **find**, espera que o elemento apareça asyncrono(futuramente) no DOM

## Testing frontend (UI testing)
Para tratar chamadas de api a partir do frontend usar o `MSW (Mock Service Work)`, pois mockamos a chamadas de api sem fazer depender de fato da implementação do backend

### Ferramentas
1. Jest
2. react-testing-library
3. Testes devem estar na pasta `/__tests__`
4. instalar: Mock service Worker
	Exemplo:
	```js
	// mockando a chamada a api do endpoint /api/shows/{showId}
	import {rest} from 'msw';

	import { readFakeData } from '../fakeData';

	export const handlers =[
		rest.get('http://localhost:3000/api/shows/:showId', async (req, res, context)=>{
			const { showId } = req.params 
			const {fakeShows} =  await readFakeData();
			return res(context.json({show: fakeShows[Number(showId)]}))
		}),
	];
	```

### Exemplos testes UI
Nos testes unitários de UI não importa, os metodos `getStaticProps` ou `getStaticPaths`, visto que no final o componente, no frontend irá receber o resultado desses metodo executados no backend.

Exemplo:
```tsx
import {render, screen} from '@testing-library/react'
import Home from '@/pages'

// Teste de página estática, testando o título do cabaçalho e a imagem de fundo

test('Home page should have the correct heading and background image',()=>{
	render(<Home />);
	const heading = screen.getByRole("heading", {name:/Welcome to Popular Concert Venue/i});
	const image = screen.getByRole("img", {name:/Concert goer with hands in the shape of a heart/i})
	// screen.debug();
	expect(heading).toBeInTheDocument();
	expect(image).toBeInTheDocument();
});
```

Exemplo:
```tsx
import {render, screen} from '@testing-library/react';
import BandPage from '@/pages/bands/[bandId]';
import {readFakeData} from '@/__tests__/__mocks__/fakeData'

test('Should show the correct band information with given ID', async ()=>{
	const {fakeBands} = await readFakeData()
	render(<BandPage band={fakeBands[0]} error={null}/>);

	const headding = screen.getByRole('heading', {name:/the wandering bunnies/i});
	const description = screen.getByText(/blistering world music, supported by a moody water glass orchestra/i);
	const image = screen.getByRole('img', {name:/the wandering bunnies/i})
	const photoBy = screen.getByRole('link', {name:/Adina Voicu/i})

	expect(headding).toBeInTheDocument();
	expect(description).toBeInTheDocument();
	expect(image).toBeInTheDocument();
	expect(photoBy).toBeInTheDocument();
});
```
## Testing next apis
### Ferramentas
1. instalar: next-test-api-route-handler
   
Será necessário também adicionar algumas configurações no arquivo `jest.setup.js`:
```js
// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom/extend-expect";

// polyfill For JSDOM tests para tastar as apis do next
import {TextEncoder, TextDecoder} from 'util'

// Mock service Worker
import {server} from './__tests__/__mocks__/msw/server'

import {resetDB} from './__tests__/__mocks__/db/utils/reset-db'

// polyfill For JSDOM tests para tastar as apis do next
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// interceptando chamadas a apis antes de qualquer teste
beforeAll(()=>server.listen());

// reseta DB para manter a consistência nos teste, principalmente de apis
beforeEach(async()=>{
	await resetDB();
});

// reseta os handlers antes depois de executar cada teste
afterEach(()=>server.resetHandlers());

// limpa e encerra o MSW após todos os teste
afterAll(()=>server.close());
```
Apenas se o db for jsons locais dentro do projeto, adicionar a configuração abaixo no arquivo `jest.confing.js` para ignorar as mudanças no bd feitas pelos próprios testes, caso contrário entrará num loop eterno.
```js
...
const customJestConfig = {
  ...
  watchPathIgnorePatterns:["<rootDir>/__tests__/__mocks__/db/.*\\.json"]
};
...
```
### Testando endpoint
#### Simple GET route
```ts
import { readFakeData } from '@/__tests__/__mocks__/fakeData';
import { testApiHandler } from 'next-test-api-route-handler';
import showsHandler from '@/pages/api/shows/index'

test('GET /api/shows, successful return show from db', async()=>{
	await testApiHandler({
		handler:showsHandler, 
		test: async ({fetch}) =>{
			const res = await fetch({method:'GET'});
			expect(res.status).toBe(200)
			const json = await res.json()
			const {fakeShows} =  await readFakeData()
			expect(json).toEqual({ shows:fakeShows });
		}
	})
})
```
#### Dynamic GET route
##### passing Params
```ts
it('GET /api/shows/[showId], successful retun response', async ()=>{
	await testApiHandler({
		handler:showIdHandler, 
		paramsPatcher: (params)=>{ params.showId = 0},
		test: async ({fetch}) =>{
			const res = await fetch({method:'GET'});
			expect(res.status).toBe(200)
			const json = await res.json()
			const {fakeShows} =  await readFakeData()
			expect(json).toEqual({ show:fakeShows[0] });
		}
	})
})
```

#### POST request
```ts
it('POST /api/user receiving token with correct credentials', async()=>{
	const user = process.env.CYPRESS_USER_EMAIL
	const password = process.env.CYPRESS_USER_PASS

	await testApiHandler({
		handler:userHandler, 
		// requestPatcher: (req)=>(req.headers = {key:process.env.SPECIAL_TOKEN}),
		test: async ({fetch}) =>{
			const res = await fetch({
				method:'POST',
				headers:{'content-type': 'application/json'},
				 body:JSON.stringify({
					email: user,
					password:password
				 })
			});
			expect(res.status).toBe(200)
			const json = await res.json()
			expect(json).toHaveProperty('user')
			expect(json.user.id).toEqual(1)
			expect(json.user.email).toEqual(user)
			expect(json.user.password).toEqual(password)
		}
	})
})

```

### Testing protect routes
Para este caso precisaremos mockar o middleware que verifica se o usuário está authenticado ou não
para este projeto o todas as rotas criadas usam um middleware para veriricar se precisam ou não de authentiacação, e caso precisem, testam para ver se está authenticado. 
Usar um middleware para isso é bem interessante pois podemos isola-lo e mocka-lo para fazer os testes.
neste projeto o middleware fica em `/lib/auth/utils.ts`. Então criaremos uma pasta `__mocks__` em `/lib/auth/` e dentro desta pasta o arquivo `utils.ts`, `/lib/auth/__mock__/utils.ts`:

```ts
module.exports ={
	esModule:true,
	validateToken:jest.fn().mockResolvedValue(true)
}
// to satisfy typescript 
export {}

// using this mock
// jest.mock("@/lib/auth/utils")
```
desta forma, nos testes precisamos interceptar a chamada verdadeira para o mock como `jest.mock("@/lib/auth/utils")`:

```ts
import  userReservationsHandler from '@/pages/api/users/[userId]/reservations';
import  reservationHandler  from '@/pages/api/reservations/[reservationId]';
import { testApiHandler } from "next-test-api-route-handler";

jest.mock("@/lib/auth/utils") // intercepta a chamada verdadeira para o mock

test('Should add a reservation form given data', async ()=>{
	await testApiHandler({
		handler:reservationHandler,
		paramsPatcher:(params)=>{params.reservationId = 12345},
		test:async({fetch})=>{
			const res = await fetch({
				method:'POST',
				headers:{'content-type': 'application/json'},
				body:JSON.stringify({
					seatCount:2, 
					userId:1,
					showId:1,
				})
			})
			const json = await res.json()
			expect(res.status).toBe(201)
		}
	});
})

```
#### Alterando o mock para teste de não authenticado
Como definimos o comportamento padrão do mock para retornar sempre `true`, agora teremos de importar a função original e retornar `false`

```ts
import  userReservationsHandler from '@/pages/api/users/[userId]/reservations';
import  reservationHandler  from '@/pages/api/reservations/[reservationId]';
import { testApiHandler } from "next-test-api-route-handler";
import {validateToken} from '@/lib/auth/utils';

jest.mock("@/lib/auth/utils") // intercepta a chamada verdadeira para o mock
const mockValidateToken = validateToken as jest.Mock // mocka a função validateToken

...

test('Should return 401 when not authenticated', async ()=>{
	mockValidateToken.mockResolvedValue(false)  
	// faz con que a função validateToken retorne sempre uma promise false
	await testApiHandler({
		handler:reservationHandler,
		paramsPatcher:(params)=>{params.reservationId = 12345},
		test:async({fetch})=>{
			const res = await fetch({
				method:'POST',
				headers:{'content-type': 'application/json'},
				body:JSON.stringify({
					seatCount:2, 
					userId:1,
					showId:1,
				})
			})
			expect(res.status).toBe(401)
		}
	});
})


```

### Passing query string
passando parametros de query string para o teste

```ts
import bandsHandler from '@/pages/api/bands'
import { testApiHandler } from "next-test-api-route-handler";


test('POST /api/bands return 401 for a incorrect revalidation secret', async ()=>{
	await testApiHandler({
		handler:bandsHandler,
		paramsPatcher:(params)=> params.queryStringURLParams = {secret : 'false secret'},
		test:async({fetch})=>{
			const res = await fetch({
				method:'POST'		
			})
			expect(res.status).toBe(401)
		}
	});
})

```

## Testing 2e2
Usando Cypress para testar end to end, sempre usaremos a versão `buildada` do site, no caso com a variaveis de ambiente de teste
### Ferramentas
1. criar uma base de dados de teste
2. instalar :Cypress, env-cmd, start-server-and-test, @testing-library/cypress, cross-env
3. criar arquivos: env.test e env.test.local

### Testing Routes SSG(static site generation) or SSR(server side rendering) 
#### Setup Cypress
`yarn add -D cypress` ou `npm i -D cypress`

#### Runing cypress
`yarn run cypress open` ou `npx cypress open`
para criar algumas configurações e pastas

### Exemplos de teste e2e
exempo do arquivo `routes.cy.js` dentro da pasta `e2e`
**NOTA: importamos os comandos do testing library para serem usados no cypress**

```js

it('displays correct heading when navigation to show route',()=>{
	cy.visit('/');
	cy.findByRole("button", {name:/shows/i}).click()
	cy.findByRole('heading', {name:/upcoming shows/i}).should('exist')
});

```

### Testing dynamic routes
```js
it('Should display the corret band name for band route that existed at build time', ()=>{
	cy.task('db:reset').visit('/bands/1'); // reset db
	cy.findByRole('heading', {name:/Shamrock Pete/i}).should('exist')
	
});

it('Should display if that there is no band for the given route at build time', ()=>{
	cy.task('db:reset').visit('/bands/12345')
	cy.findByRole('heading', {name:/Could not retrieve band data: Error: band not found/i}).should('exist')
});

it('Should add a new band there is not present at build time an teste if there is created route in run time',()=>{
	const bandId = generateRandomId()
	const newBand = generateNewBand(bandId)
	cy.task('db:reset').task('band:add', newBand)
	cy.visit(`/bands/${bandId}`)
})
```
#### Cypress tasks
Exemplo: implementando uma task para resetar o DB, no arquivo `./cypress.config.ts`

```ts
import { addBand } from '@/lib/features/bands/queries';
import { resetDB } from '__tests__/__mocks__/db/utils/reset-db';
import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('task', {
        "db:reset":()=>resetDB().then(()=>null),
        "band:add":(newBand)=>addBand(newBand).then(()=>null),
      });
    },
  },
});


```

### Testing Routes ISR(Incremental Static Regeneration) 
1. Testar se os dados estão em cache
2. Se revalidation está funcionando atualizando o cache
3. Se a página está requisitando novos dados em dado intervalo

#### Testing ISR cache
Exemplo:
```js
it('should load bands page data from cache', ()=>{
	cy.request('/bands')
	.its('body')
	.then(html =>{
		// remove client scripts
		const staticHTML = html.replace(/<script.*?>.*?<\/script>/gm, '')
		cy.state('document').write(staticHTML)
	});
	cy.findByRole('heading', {name:/the joyous nun riot/i}).should('exist')
	cy.findByRole('heading', {name:/shamrock pete/i}).should('exist')
	cy.findByRole('heading', {name:/the wandering bunnies/i}).should('exist')
})

```

#### Testing on-demand revalidation
Funcionará da primeira vez os testes porém, ao rodar da segunda, os dados estarão já em cache, então para facilitar a retestabilidade, iremos criar um endpoint só para limpar o cache do da rota especificada!
para isso criaremos adicionaremos ao `commands.js` dentro da pata `/cypress/support/` um comando para automatizar a chamada do novo endpoint e limpar a base de dados
endpoint para revalidate em `/api/revalidate/index.ts` 
outro detalhe é criar uma variavel de ambiente `APP_ENV` como o valor de `teste`, pois a variavel `NODE_ENV` é setada para `production` quando rodamos o comando build.
:

```ts
import { NextApiResponse } from 'next';
import { NextApiRequest } from 'next';
import { createHandler } from "@/lib/api/handler";

const handler = createHandler();
handler.get(async(req: NextApiRequest, res:NextApiResponse)=>{
	if(process.env.APP_ENV !== "test"){
		return res.status(401).json('endpoint only available for test use');
	}

	if(req.query.secret !== process.env.REVALIDATION_SECRET){
		return res.status(401).json('invalid revalidation secret');
	}
	if(!req.query.route){
		return res.status(401).json('invalid route');
	}

	// await res.revalidate('/shows')
	// await res.revalidate('/bands')
	await res.revalidate(req.query.route as string)
	return res.status(200).end();
});
export default handler;
```
Adicionando o comando no `/cypress/support/commands.js`

 ```js
 // adicionando comandos do testing library para o cypress
import "@testing-library/cypress/add-commands";

Cypress.Commands.add('resetDbAndClearISRCache',(route)=>{
	cy.task('db:reset');
	const secret = Cypress.env("REVALIDATION_SECRET");
	cy.request('GET', `api/revalidate?secret=${secret}&route=${route}`);
})
```
e por fim o teste
```js
import { generateRandomId } from "../../lib/features/reservations/utils"
import {generateNewBand} from '../../__tests__/__mocks__/fakeData/newBand'
	it('Should load refresedh load from cache after new band is added', ()=>{
		// check if newBand is not on page
		cy
		.task('db:reset')
		.visit('/bands');
		cy.findByRole('heading', {name:/avalanche of cheese/i}).should('not.exist')

		// add new band via post request to api
		const bandId = generateRandomId()
		const newBand = generateNewBand(bandId);
		const secret = Cypress.env("REVALIDATION_SECRET")
		cy.request('POST', `/api/bands?secret=${secret}`, {newBand})
		.then((res)=>{
			// muda a sintaze do do assert, sabe-se lá pq
			expect(res.body.revalidated).to.equal(true)
		})

		//reload the page and see if new band is there
		cy.reload()
		cy.findByRole('heading', {name:/avalanche of cheese/i}).should('exist')

		//reset ISR cache
		cy.resetDbAndClearISRCache('/bands')
	})

```

#### Testing revalidation on interval CSR(client side rendering) (SWR - Stale While Revalidate)
Ferramentas: SWR ou React Query

```js
import {generateNewReservation} from '../../__tests__/__mocks__/fakeData/newReservation'
import { generateRandomId } from '../../lib/features/reservations/utils'

const ONE_SECOND = 1000;
const THIRDY_SECONDS = 30 * ONE_SECOND;

it('Should refresh shows page after 30 seconds, checking for new data', ()=>{
	cy.clock();
	cy.task('db:reset').visit('/shows')

	//should be only one sold out show
	cy.findAllByText(/sold out/i).should('have.length', 1);

	// buy tickects to first show (id=0 available seats = 10)
	const newReservation = generateNewReservation({
		reservationId: generateRandomId(),
		showId:0,
		seatCount:10
	})
	cy.task('reservation:add', newReservation)

	// advance clock in one second
	cy.tick(ONE_SECOND);
	cy.findAllByText(/sold out/i).should('have.length', 1);

	// advance clock in 30 seconds, should see 2 sould out shows
	cy.tick(THIRDY_SECONDS);
	cy.findAllByText(/sold out/i).should('have.length', 2);
});

```
### Testing Authentication(next-auth)
```js
it('Should validate auth flow for fail login and then successful login to protected user page', ()=>{
	// using show id = 0
	cy
	.task('db:reset')
	.visit('/user')

	// should load sign in form
	cy.findByRole('heading', {name:/sign in to your account/i}).should('exist')

	// log in
	const user = Cypress.env('USER_EMAIL')
	const password = Cypress.env('USER_PASS') 

	cy.findByLabelText(/email address/i)
	.clear()
	.type(user)
	
	cy.findByLabelText(/password/i)
	.clear()
	.type(password+'*')

	cy.findByRole('main').within(()=>cy.findByRole('button', {name:/sign in/i}).click())

	//should fail login showing error message
	cy.findByText(/Sign in failed/i).should('exist')

	//try again sucessfuly
	cy.findByLabelText(/password/i)
	.clear()
	.type(password)
	cy.findByRole('main').within(()=>cy.findByRole('button', {name:/sign in/i}).click())

	// verify user page
	cy.findByRole('heading', {name:`Welcome ${user}`}).should('exist')
	
});
```
### parametrize test
Para fazer o mesmo teste com dados diferentes, por exemplo testar se todas as páginas que precisam de authenticação redirecionam para o login caso não esteja logado.
criar o arquivos `protected-pages.json` na pasta `/cypress/fixtures`, com um array de rotas que devem estar protegidas:
```json
[
	"/reservations/0",
	"/user"
]
```

Então, testar
```js
it('Should redirect to sign in for protected pages if not logged',()=>{
	cy.fixture("protected-pages.json").then((pages)=>{
		pages.forEach(page => {
			cy.visit(page)
			cy.findByLabelText(/email address/i).should('exist')
			cy.findByLabelText(/password/i).should('exist')
		});
	})
})
```