
it('Should redirect to sign in for protected pages if not logged',()=>{
	cy.task('db:reset').fixture("protected-pages.json").then((pages)=>{
		pages.forEach(page => {
			cy.visit(page)
			cy.findByLabelText(/email address/i).should('exist')
			cy.findByLabelText(/password/i).should('exist')
		});
	})
})

it('Should validate auth flow for successful login to protected reservations page', ()=>{
	// using show id = 0
	cy
	.task('db:reset')
	.visit('/reservations/0')

	// should load sign in form
	cy.findByRole('heading', {name:/sign in to your account/i}).should('exist')

	// log in
	const user = Cypress.env('USER_EMAIL')
	const password = Cypress.env('USER_PASS')

	cy.findByLabelText(/email address/i)
	.clear()
	.type(user)
	
	cy.findByLabelText(/password/i)
	.clear()
	.type(password)

	cy.findByRole('main').within(()=>cy.findByRole('button', {name:/sign in/i}).click())

	// shoul load reservation/0
	cy.findByRole('heading', {name:/The Wandering Bunnies/i}).should('exist')
	cy.findByRole('button', {name:/purchase/i}).should('exist')

	// should have header with user(email) button and sign out
	cy.findByRole('button', {name:user}).should('exist')
	cy.findByRole('button', {name:/sign out/i}).should('exist')
});

it('Should validate auth flow for fail login and then successful login to protected user page', ()=>{
	// using show id = 0
	cy
	.task('db:reset')
	.visit('/user')

	// should load sign in form
	cy.findByRole('heading', {name:/sign in to your account/i}).should('exist')

	// log in
	const user = Cypress.env('USER_EMAIL')
	const password = Cypress.env('USER_PASS') 

	cy.findByLabelText(/email address/i)
	.clear()
	.type(user)
	
	cy.findByLabelText(/password/i)
	.clear()
	.type(password+'*')

	cy.findByRole('main').within(()=>cy.findByRole('button', {name:/sign in/i}).click())

	//should fail login showing error message
	cy.findByText(/Sign in failed/i).should('exist')

	//try again sucessfuly
	cy.findByLabelText(/password/i)
	.clear()
	.type(password)
	cy.findByRole('main').within(()=>cy.findByRole('button', {name:/sign in/i}).click())

	// verify user page
	cy.findByRole('heading', {name:`Welcome ${user}`}).should('exist')
	
});

it('Should validate the flow of login to purchase tikets, ending in shows page',()=>{
	const user = Cypress.env('USER_EMAIL')
	const password = Cypress.env('USER_PASS') 

	cy.task('db:reset').signIn(user, password)

	cy.visit('/reservations/0')

	cy.findByLabelText(/email address/i).should('not.exist')
	cy.findByLabelText(/password/i).should('not.exist')

})
