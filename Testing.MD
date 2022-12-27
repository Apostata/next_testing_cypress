# Testing
 ## testing library remember
 ### Queries
 #### Command
1. **get**, espera que o elemento que esteja no DOM:
   * getByRole, = getByRole('role', {...options}), exemplo
   * expect(htmlHelement)`.getByRole('link', {name: /learn react/i}` - Pega o elemento do tipo link de texto 'learn react', not case sensitive
   * veja : https://www.w3.org/TR/wai-aria/#role_definitions para roles de cada elemento do DOM
2. **query**, espera que o elemento que NÃO está no DOM
3. **find**, espera que o elemento apareça asyncrono

## UI testing
Para tratar chamadas de api a partir do frontend usar o `MSW (Mock Service Work)`, pois mockamos a chamadas de api sem fazer depender de fato da implementação do backend

### Ferramentas
1. Jest
2. react-testing-library
3. Testes devem estar na pasta `/__tests__`
4. Mock service Worker
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


#### Testing Static page
No teste unitário não importa os metodos `getStaticProps` ou `getStaticPaths`, visto que no final o componente, no frontend irá receber o resultado desses metodo executados no backend.

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

#### Testing SSG e CSG (Static Site Generation e Client Side Generation)
No teste unitário não importa os metodos `getStaticProps` ou `getStaticPaths`, visto que no final o componente, no frontend irá receber o resultado desses metodo executados no backend.

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