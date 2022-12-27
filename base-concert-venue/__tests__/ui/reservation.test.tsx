import {render, screen} from '@testing-library/react';
import {Reservation} from '@/components/reservations/Reservation';

test('Should show the correct number of available seats for the given showId', async()=>{
	render(<Reservation showId={0} submitPurchase={jest.fn()}/>);
	const seatsCount = await screen.findByText(/10 seats left/i)
	expect(seatsCount).toBeInTheDocument();
});


test('Should show "sold aout" and no Purchase button for the given showId', async()=>{
	render(<Reservation showId={1} submitPurchase={jest.fn()}/>);
	const seatsCount = await screen.findByText(/sold out/i)
	const purchaseButton = screen.queryByRole('button', {name:/purchase/i})
	expect(seatsCount).toBeInTheDocument();
	expect(purchaseButton).not.toBeInTheDocument()
});
