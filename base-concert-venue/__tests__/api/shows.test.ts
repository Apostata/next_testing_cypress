import { readFakeData } from '@/__tests__/__mocks__/fakeData';
import { testApiHandler } from 'next-test-api-route-handler';
import showsHandler from '@/pages/api/shows/index'
import  showIdHandler  from '@/pages/api/shows/[showId]';

interface DynType{
	[key:string]: any
}

test('GET /api/shows, successful return response', async()=>{
	await testApiHandler({
		handler:showsHandler, 
		// requestPatcher: (req)=>(req.headers = {key:process.env.SPECIAL_TOKEN}),
		test: async ({fetch}) =>{
			const res = await fetch({method:'GET'});
			expect(res.status).toBe(200)
			const json = await res.json()
			const {fakeShows} =  await readFakeData()
			expect(json).toEqual({ shows:fakeShows });
		}
	})
});

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

it('POST /api/show return 401 for a incorrect revalidation secret', async()=>{
	await testApiHandler({
		handler:showsHandler,
		paramsPatcher:(params)=> params.queryStringURLParams = {secret : 'false secret'},
		test: async({fetch})=>{
			const res = await fetch({method: 'POST'})
			expect(res.status).toEqual(401)
		}
	})

})

