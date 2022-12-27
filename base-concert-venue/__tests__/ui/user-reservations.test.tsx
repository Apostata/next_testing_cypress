import {render, screen} from '@testing-library/react';
import { UserReservations } from '@/components/user/UserReservations'

test('Should retrieve all users reservation for the given userId', async ()=>{
	render(<UserReservations userId={1}/>)
	const purchaseMoreButton = await screen.findByRole('button', {name:/purchase more tickets/i})
	const tickects = await screen.findAllByRole('listitem')

	expect(purchaseMoreButton).toBeInTheDocument();
	expect(tickects).toHaveLength(2)
});

test('Should retrieve no reservation for the given userId (that has no purchase)', async ()=>{
	render(<UserReservations userId={0}/>)
	const purchaseMoreButton = await screen.findByRole('button', {name:/purchase tickets/i})
	expect(purchaseMoreButton).toBeInTheDocument();
});