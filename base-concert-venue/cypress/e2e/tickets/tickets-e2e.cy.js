const ONE_SECOND = 1000;
const FIFITEEN_SECONDS = ONE_SECOND * 15;

it('Should validate the entire user flow to buy a ticket to a show and then logout',()=>{
	// navigate to shows page and try to buy a ticket for the last show
	cy.task('db:reset').visit('/')
	cy.findByRole('button', {name:/shows/i}).should('exist').click()
	cy.findByRole('heading', {name:/upcoming shows/i}).should('exist')
	cy.findAllByRole('button', {name:/tickets/i}).should('have.length.of', 3).last().click()
	// redirect to login and sign in
	const user = Cypress.env('USER_EMAIL')
	const password = Cypress.env('USER_PASS') 
	cy.fillSignInForm(user, password)
	// show show reservations/2 page 
	cy.findByRole('heading', {name:/100 seats left/i}).should('exist')
	cy.findByRole('spinbutton').clear().type(5)
	cy.findByRole('button',{name:/purchase/i}).should('exist').click()
	cy.findByText(/5 seats confirmed/i).should('exist')
	cy.findByRole('button', {name:/see all purchases/i}).click()
	// show user page with the bought tickets
	cy.findByRole('heading', {name:/your tickets/i}).should('exist')
	cy.findByText(/5 seats for/i).within(()=>cy.findAllByRole('heading', {name:/the joyous nun riot/i})).should('exist')
	// navigate to shows page again and go to the last show to confirm if the seats are now 95
	cy.findAllByRole('button', {name:/shows/i}).click()
	// await 300 ms for race conditions, I think is the useEffect to reload page
	cy.wait(300);
	cy.findByRole('heading', {name:/upcoming shows/i}).should('exist')
	cy.findAllByRole('button', {name:/tickets/i}).should('have.length.of', 3).last().click()
	cy.findByRole('heading', {name:/95 seats left/i}).should('exist')
})