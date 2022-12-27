# Next.js 
* Já tem SSR (Server side rendering)
* ótimo para SEO (search engine optimization)
* Serverside rendering  in first load, depois mescla de browser render e SSR
* file base routing
  * folder page

## Criando um app
`npx create-next-app`

caso o vscode esteja dando erro : `Cannot find module 'next/babel'`

criar um arquivo `.babelrc` na raiz do projeto com o seguinte código:
```json
{
  "presets": ["next/babel"],
  "plugins": []
}

```
e adicionar ao .eslintrc.json o "next-babel" a propriedade extends:
```json
{
  "extends": [..., "next/babel"]
}
```

## Atualizando um app em Next:
`npm i next@latest react@latest react-dom@latest eslint-config-next@latest`
ou 

`yarn upgrade next react react-dom eslint-config-next --latest`
ou

`pnpm up next react react-dom eslint-config-next --latest`

## Adicionando typescript

  ### Novo Projeto

  `npx create-next-app@latest --ts`
  ou
  `yarn create next-app --typescript`
  ou
  `pnpm create next-app --ts`

  ### Projeto Existente

  `touch tsconfig.json` , aparentemente o Next.js já configurará todo o arquivo automaticamente.

`npm run dev` após as configurações e o Next irá guia-lo para caso necessite de algum pacote para finalizar a instalação do typescript

## Routing (file based routing)
Todas o roteamento é feito pela pasta `pages`
dentro da pasta pages pode haver outras pastas, o que vai sugnificar que tem sub-rotas:

pages/
  index.js    --> por padrão do next é a Home,                      url: {domain}/
  about.js    --> página about                                      url: {domain}/about
  products/   --> rota que contem subrotas       
    index.js  --> rota inicial de products                          url: {domain}/products
    [data].js --> rota dinâmica para pegar "data"                   url: {domain}/products/:data (exemplo: /products/1) 
  blog/
    [...data] --> rota dinâmica para pegar "tudo" após /blog        url: {domain}/blog/:data1/:data2/:data3 (exemplo: /blog/2021/19/16) gerá um array ["2021","19","16"]

### pegando parametros das rotas nas páginas
Para pegar os parâmetros das rotas passados para o componente, vamos importat o hook `useRouter` de `next/routes` e os dados estrão na propriedade `query` de router:
no caso do [...data] acima retornará um array

```jsx
import { useRouter } from "next/router";

export default function PortfolioProject() {
  const router = useRouter();
  const { projectId } = router.query;

  return (
    <div>
      <h1>Portfolio project of id: {projectId}</h1>
    </div>
  );
}
```

### usando links
para mudar de rotas e preservar o stado usa-se o `<Link />`
por padrão link ira dar um push nas rotas, adicionando no histórico, mas pode ser setado uma propriedade `replace` para que o histórico seja substituido ao invés de adicionado

```jsx
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h1>Home Page!</h1>
      <ul>
        <li>
          <Link replace href="/portfolio">portfolio</Link>
        </li>
        <li>
          <Link replace href="/clients">clients</Link>
        </li>
      </ul>
    </div>
  );
}

```

### Passando parametros nos links
```jsx
<Link href={`/clients/${id}`}>{name}</Link>

// ou

<Link
  href={{
    pathname: `/clients/[id]`,
    query: { id: id },
  }}
>{name}</Link>
```

### Navigating programmatically

```jsx
import { useRouter } from "next/router";
export default function ClientProjectsById() {
  const router = useRouter();
  const {
    query: { id },
  } = router;
  return (
    <div>
      <h1>List of projects by client, client id:{id}</h1>
      <button
        onClick={() => {
          router.push(`/clients/${id}/12`);
          // ou

           router.push({ 
             pathName:`/clients/[id]/[projectId]`
             query: { 
               id: id 
               projectId :12
              },
            });
        }}
      >
        Load Project 12
      </button>
    </div>
  );
}

```
### Custom 404 page
na pasta page, basta criar um arquivo de nome `404.js`

## Styling
nada de novo, usa css modules até então

## Adicionando layout ao app
o arquivo `_app.js` que fica na pasta `pages` é o arquivo que trata as rotas através de suas props, seria o equivalente ao `BrowserRouter` do `react-router`. só que as rotas no next são definidas pelos demais arquivos na pasta `pages`

para adicionar um layout envolvendo cada rota, basta envolve-lo com o layout:

```tsx
import { AppProps } from "next/app";
import Layout from "../components/layout/layout";
import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;
```

## Pre-render
Carrega o HTML e os dados que precisamos, genrando uma página via Server rendering já otimizada para o SEO. Somente no primeiro carregamento da página.
Por padrão o next já pré-rendereriza qualquer página, menos as dinâmicas

### Hydrate
 Carrega os arquivos js para que a página continue dinâmica como no react normal, delegando as rotas para o front, como padrão do react (SPA)

### static generation  - Pré-render
Gera em tempo de build-time, na geração da versão deployada, uma versão estática do site para que os mecanismos de busca fiquem felizes, podem ser armazenadas no cache.

O cliente ou o robo ao entrar no site ve uma versão estática, já com conteúdo antes mesmo de o react entrar em ação no browser. Só então o next itilizará a técnica de `Hydrade` que é após o carregamento inicial do conteúdo estático, ele irá re-renderizar o site com a versão SPA e a partir dai o React assume

roda quando executamos o `yarn build` ou `npm run build`
mas caso tenhamos alterações frequentes utilizaremos:
#### getStaticProps 

Função de pre-render para carregar dados do server inicialmente na página, disponível apenas em componentes dentro da pasta Pages para dizer ao Next quais dados pré-renderezar na página via `static generation`, 
Ou seja dos dados pre-renderizados estarão como estáticos para qualquer mecanismos de busca, otimizando assim o SEO.

exemplo:
```tsx
import React from "react";
import { Product } from "../models/product_model";
import { getProductsFromJsonFile } from "../services/product_service";


interface Props{
  products: Product[]
}

const HomePage : React.FC = (props: Props)=>{
  const {products} = props;

  return (
    <ul>
      {products.map((product)=>(
        <li key={product.id}>{product.title}</li>
        )
      )}
    </ul>
  );
}

// server-side 
export async function getStaticProps(){
  const data = await getProductsFromJsonFile()
  return {
    props: {
      products:data.products
    },
  };
};

export default HomePage;

```
##### Incremental static generation
caso tenha uma página em que os dados mudem com frequencia, podemos utilizar no `getStaticProps` o `revalidate` para que a cada X segundos a página seja pré-renderizada, mantendo assim a atualização do frontend de acordo com os dados passados pelo server.

```tsx
import React from "react";
import { Product } from "../models/product_model";
import { getProductsFromJsonFile } from "../services/product_service";


interface Props{
  products: Product[]
}

const HomePage : React.FC = (props: Props)=>{
  const {products} = props;

  return (
    <ul>
      {products.map((product)=>(
        <li key={product.id}>{product.title}</li>
        )
      )}
    </ul>
  );
}

// server-side 
export async function getStaticProps(){
  const data = await getProductsFromJsonFile()
  return {
    props: {
      products:data.products
    },
    revalidate: 10 // only for production
  };
};

export default HomePage;

```

##### Outras opções para configuração do getStaticProps:
ainda podemos passar `notFound` e o `redirect` para o retorno de `getStaticProps`
1. notFound: retorna a página 404 
2. redirect: redireciona para uma página específica

```tsx
interface Props{
  products: Product[]
}

const HomePage : React.FC = (props: Props)=>{
  const {products} = props;

  return (
    <ul>
      {products.map((product)=>(
        <li key={product.id}>{product.title}</li>
        )
      )}
    </ul>
  );
}

// server-side 
export const getStaticProps: GetStaticProps  = async (context) =>{
  const data = await getProductsFromJsonFile()

  if(!data){
    return{
      redirect: {
        destination: '/no-data',
        permanent: false //obrigatório com type script, seja true ou false
      }
    }
  }

  if(data.products?.length < 1){
    return { notFound: true}
  }

  return {
    props: {
      products:data.products
    },
    revalidate: 10, // only for production
  };
};

```

#### getStaticPaths (for dynamic pages)
disponível apenas em componentes dentro da pasta Pages em especial, usado para páginas dinâmicas, para que saiba qual o range de informação deve ser pré-renderizado visto que é dinâmica.

```tsx
import { GetStaticPaths, GetStaticProps } from 'next'
import React, { Fragment } from 'react'
import { Product } from '../../models/product_model'
import { getProductFromByIdFromJsonFile } from '../../services/product_service'

interface Props{
	product: Product
}

const ProductDetail = (props:Props) =>{
	const {product} = props

  if(!product){ // fallback para página não pre-renderdizadas
    return <p>loading ...</p>
  }

  return (
	<Fragment>
		<h1>{product.title}</h1>
		<p>{product.description}</p>
	</Fragment>
  )
}

export const getStaticProps: GetStaticProps = async (context)=>{
	const {params}= context;
	const id = params.id;
	const product =  await getProductFromByIdFromJsonFile(id as string)
	return {
		props:{
			product
		}
	}
}

export const getStaticPaths: GetStaticPaths = async ()=>{
	return { 
		paths:[
			{params:{id:'p1'}},
			// {params:{id:'p2'}},
			// {params:{id:'p3'}}
		],
		fallback: true,
	}
}

export default ProductDetail

```

##### getStaticPaths fallback
Quando fallback = true, ele só irá pre-renderizar as páginas definidas em paths, as demais serão renderdizadas quando requisitadas
Porém quando for digitado o link direto para ela, não existirá ainda pois não está pre-renderizada e a requisição do produto é assincrona, por isso é necessário colocar um componente de fallback caso ainda não tenha carregado o produtdo
fallback pode aceitar booleanos e a string 'blocking'
porém pode ser que tenha um id que não exite, neste caso ele irá causar um erro. neste caso teremos que definir um notFound 
quando fallback está como 'blocking' next só mostrará a página depois de carregar os dados necessários (particularmente gostei mais)


gerando os paths dinâmicamente:
```tsx
...
export const getStaticProps: GetStaticProps = async (context)=>{
	const {params}= context;
	const id = params.id;
	const product =  await getProductFromByIdFromJsonFile(id as string)
  
	if(!product){
		return {notFound: true}
	}

	return {
		props:{
			product
		}
	}
}

...
export const getStaticPaths: GetStaticPaths = async ()=>{
	const {products} =  await getProductsFromJsonFile()
	const params = products.map((product)=>({
		params:{
			id:product.id
		}
	}));
	return { 
		paths:params,
		fallback: 'blocking',
	}
}

...

```
### server side rendering - Pré-render
Quando você precisa do pre-render em cada requisição, quando por exemplo você quer extrair os cookies

#### getServerSideProps
não pode ser usada em conjunto com `getStaticProps`, aceita os mesmo parametros e opções de `getStaticProps`, menos o `revalidate` visto que é pre-rendereriza em toda requisição.
o parametro `context` possúi toda a requisição também além de params e a outras props de `getStaticProps`:
`const { params, req, res } = context;`

por ser sempre gerada no backend em tempo de requisição, não necessita do `getStaticPaths`

```tsx
import { GetServerSideProps } from 'next/types'
import React from 'react'

interface Props{
	userName: string
}

 const UserProfile = (props: Props) => {
	const {userName} = props;
  return (
	<div>{userName}</div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context)=>{
  const { params, req, res } = context;
	return {
		props:{
			userName: 'Rene'
		}
	}
}

export default UserProfile;


```

### Client-side data fetching (normal no react comum), quando usar?
Um exemplo seria uma lista de produtos favoritos, uma lista de recomendações para você, um infinite scrool.
```tsx
import React, { useEffect, useState } from 'react'
import { Sales } from '../../models/sales_models'
import { getSales } from '../../services/sales_service'

 const LastSales = () =>{
	const [sales, setSales] = useState<Sales[]| undefined>()
	const [loading, setLoading] = useState(false)

	useEffect(()=>{
		const fetchSales = async ()=>{
			setLoading(true)
			const res = await getSales()
			if( res instanceof Error){
				throw res;
			} else{
				setSales(res)
				setLoading(false)
			}
			
		}
		fetchSales()
	},[])

	if(!sales){ // para renderizar no pre-render da página e ter algum conteúdo
		return <p>No data yet!</p>
	}

	if(loading){
		return<p>Loading ...</p>
	}

  return (
	<ul>{sales.map((sale)=><li key={sale.id}>{sale.username} - {sale.volume}</li>)}</ul>
  )
}
export default LastSales;

```
#### SWR ou React-query
para cachear as requisições. Recomendo React-query. [Tutorial](https://github.com/Apostata/react-query-tutorial)


### Pre-resndering + Client side rendering
```tsx
import { GetStaticProps } from 'next'
import React from 'react'
import { getSalesWithReactQuery } from '../../helpers/react-queries/sales-queries'
import { getSales } from '../../services/sales_service'
import { Sale, SaleToJson } from '../../models/sales_models'

interface Props{
	sales: Sale[]
	error: string | null
}

 const LastSales =  (props:Props) =>{
	const {data, error:err, isLoading:loading} =  getSalesWithReactQuery(true)
	const sales = props.sales || data;
	const error = props.error || err;


	if(error){
		return <p>Erro!</p>
	}
	
	if(sales){
		return (
			<ul>{sales.map((sale)=><li key={sale.id}>{sale.username} - {sale.volume}</li>)}</ul>
		)
	}
	
	
	if(loading){
		return<p>Loading ...</p>
	}

	if(!sales){ // para renderizar no pre-render da página e ter algum conteúdo
		return <p>No data yet!</p>
	}
	
}
export default LastSales;

export const getStaticProps: GetStaticProps = async(context)=>{
	const res = await getSales()
	const isSales = (res as Sale[]).every((item)=> item instanceof Sale)
	const isError = res instanceof Error
	
	return {
		props:{
			sales: isSales? (res as Sale[]).map((sale)=>SaleToJson(sale)) : ([] as Sale[]),
			error: isError? (res as Error).message : null
		}, revalidate: 10
	}
}

``` 

## add Head Metadata
Importando a tag `Head` de `next/head` podemos adicionar em qualquer lugar do componente para adicionarmos as tag de meta dados ao head do HTML:

```tsx
import Head from 'next/head';
...

const SomeComponent= ()=> {
  return (
    <div>
      ...somecontent
      <Head>
        <title>Some Title</title>
        <meta name='description' content='someDescription'/>
      </Head>
    </div>
  )
}
```

### use _app.js ou (tsx) file
_app.js file é o arquivo raiz da aplicação e seu conteúdo é renderizado em todas as páginas do app. Da mesma forma que no exemplo anterior mas será renderizado para todas as página, por exemplo a meta tag de viewport:
```tsx
import Layout from '../components/layout/layout';
import { QueryClient, QueryClientProvider } from 'react-query';
import '../styles/globals.css';
import Head from 'next/head'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 0 } },
})

function MyApp({ Component, pageProps }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Layout>
         <Head>
          <title>Next Events</title>
          <meta name='description' content='NextJS Events' />
          <meta name='viewport' content='initial-scale=1.0, width=device-width' />
        </Head>
        <Component {...pageProps} />
      </Layout>
    </QueryClientProvider>
  );
}

```
tudo que estiver em head em outra pagina ele irá juntar o do arquivo _app.js como o de outra página

## _documen.js file:
Permite customizar todo o documento html inicial exemplo:
```tsx
import Document, {Html, Head, Main, NextScript} from "next/document";

class MyDocument extends Document{
	render(): JSX.Element {
		return (
			<Html lang="pt-BR">
				<Head />
				<body>
					<div id='overlay'/>
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}

export default MyDocument
```

## Optimizing Images for production
usando a tag  image especial do Next:
```tsx
...
<Image  src={'/' + image} alt={title} width={250} height={160} />
...

```
a largura e altura definidas na tag é só para determinar o tamanho da imagem que o backend irá trazer
doc: [next/image](https://nextjs.org/docs/api-reference/next/image)