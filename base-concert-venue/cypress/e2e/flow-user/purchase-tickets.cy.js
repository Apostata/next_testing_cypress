it('Should purchase more tickets',()=>{
	// navigate to user page, should redirect to login
	const user = Cypress.env('USER_EMAIL')
	const password = Cypress.env('USER_PASS') 
	// login
	cy.task('db:reset').signIn(user, password)
	// users page
	cy.findByRole('button', {name:/purchase more/i}).should('exist').click()
	// shows page
	cy.findByRole('heading',{name:/upcoming shows/i}).should('exist')

})
