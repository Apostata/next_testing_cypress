import {generateNewReservation} from '../../../__tests__/__mocks__/fakeData/newReservation'
import { generateRandomId } from '../../../lib/features/reservations/utils'

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

it('Should refresh reservations page for The Wandering Bunnies show after 30 seconds, checking for new data', ()=>{
	cy.clock();
	cy.task('db:reset').visit('/reservations/0')
	cy.findByRole('main')
	.within(
		()=> cy.findByRole('button', {name:/sign in/i})
		.click()
	)

	// //should be only one sold out show
	cy.findByRole('heading', {name:/10 seats left/i}).should('exist');

	// buy tickects to first show (id=0 seats left = 4)
	const newReservation = generateNewReservation({
		reservationId: generateRandomId(),
		showId:0,
		seatCount:2
	})
	cy.task('reservation:add', newReservation)

	// advance clock in one second
	cy.tick(ONE_SECOND);
	cy.findByRole('heading', {name:/10 seats left/i}).should('exist');

	cy.tick(THIRDY_SECONDS);
	cy.findByRole('heading', {name:/8 seats left/i}).should('exist');

	// advance clock in 30 seconds, should see 2 sould out shows
	const newReservation2 = generateNewReservation({
		reservationId: generateRandomId(),
		showId:0,
		seatCount:8
	})
	cy.task('reservation:add', newReservation2)
	cy.tick(THIRDY_SECONDS);
	cy.findByRole('heading', {name:/Show is sold out!/i}).should('exist');
});