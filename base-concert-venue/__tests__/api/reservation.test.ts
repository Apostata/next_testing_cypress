import  userReservationsHandler from '@/pages/api/users/[userId]/reservations';
import  reservationHandler  from '@/pages/api/reservations/[reservationId]';
import { testApiHandler } from "next-test-api-route-handler";
import {validateToken} from '@/lib/auth/utils';

jest.mock("@/lib/auth/utils")
const mockValidateToken = validateToken as jest.Mock

test('Should add a reservation form given data', async ()=>{
	mockValidateToken.mockResolvedValue(true) 
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
	await testApiHandler({
		handler:userReservationsHandler,
		paramsPatcher:(params)=>{params.userId = 1},
		test:async({fetch})=>{
			const res = await fetch({
				method:'GET',
			})
			expect(res.status).toBe(200)
			const {userReservations} = await res.json()
			expect(userReservations).toHaveLength(3)
		}
	});
})

test('Should return 401 when not authenticated', async ()=>{
	mockValidateToken.mockResolvedValue(false) 
	await testApiHandler({
		handler:reservationHandler,
		paramsPatcher:(params)=>{params.reservationId = 12345},
		test:async({fetch})=>{
			const res = await fetch({
				method:'POST'		
			})
			expect(res.status).toBe(401)
		}
	});
})
