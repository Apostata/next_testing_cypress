import bandsHandler from '@/pages/api/bands'
import { testApiHandler } from "next-test-api-route-handler";
import {validateToken} from '@/lib/auth/utils';

// jest.mock("@/lib/auth/utils")
// const mockValidateToken = validateToken as jest.Mock


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
