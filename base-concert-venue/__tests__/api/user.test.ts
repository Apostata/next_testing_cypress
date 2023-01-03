import  userReservationsHandler from '@/pages/api/users/[userId]/reservations';
import { testApiHandler } from 'next-test-api-route-handler';
import userHandler from '@/pages/api/users/index'
import {validateToken} from '@/lib/auth/utils'

jest.mock("@/lib/auth/utils")
const mockValidateToken = validateToken as jest.Mock;


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
			expect(json.user).toHaveProperty('token')
		}
	})
})

it('GET /api/user/[userId]/reservations return correct number of reservations', async()=>{
	await testApiHandler({
		handler:userReservationsHandler, 
		paramsPatcher: (params)=>{ params.userId = 1},
		test: async ({fetch}) =>{
			const res = await fetch({method:'GET'})
			expect(res.status).toBe(200)
			const {userReservations} = await res.json()
			expect(userReservations).toHaveLength(2);
		}
	})
})

test('GET /api/user/[userid]/reservations should\'t return any reservations', async()=>{
	await testApiHandler({
		handler:userReservationsHandler,
		paramsPatcher: (params)=>{params.userId = 123456},
		test: async ({fetch})=>{
			const res = await fetch({method: 'GET'})
			expect(res.status).toBe(200)
			const {userReservations} = await res.json()
			expect(userReservations).toHaveLength(0);
		}
	})
})

it('GET /api/user/[userId]/reservations return 401, when not authenticated', async()=>{
	mockValidateToken.mockResolvedValue(false)
	await testApiHandler({
		handler:userReservationsHandler, 
		paramsPatcher: (params)=>{ params.userId = 1},
		test: async ({fetch}) =>{
			const res = await fetch({method:'GET'})
			expect(res.status).toBe(401)

		}
	})
})