import {rest} from 'msw';

import { readFakeData } from '../fakeData';

export const handlers =[
	
	rest.get('http://localhost:3000/api/shows/:showId', async (req, res, context)=>{
		const {showId} = req.params 
		const {fakeShows} =  await readFakeData();
		return res(context.json({show: fakeShows[Number(showId)]}))
	}),
	rest.get('http://localhost:3000/api/users/:userId/reservations', async (req, res, context)=>{
		const {userId} = req.params 
		const {fakeReservations, fakeShows} =  await readFakeData();
		const userReservations = fakeReservations
		.filter((reservation)=>reservation.userId === Number(userId))
		.map((reservation)=>({...reservation,show: fakeShows.find((show)=>show.id===reservation.showId)}));
		return res(context.json({userReservations: userReservations}));
	}),
];