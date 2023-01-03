// adicionando comandos do testing library para o cypress
import "@testing-library/cypress/add-commands";

Cypress.Commands.add('resetDbAndClearISRCache',(route)=>{
	cy.task('db:reset');
	const secret = Cypress.env("REVALIDATION_SECRET");
	cy.request('GET', `api/revalidate?secret=${secret}&route=${route}`);
})

Cypress.Commands.add('signIn',(user, password)=>{
	cy.visit('/auth/signin');
	cy.fillSignInForm(user, password)
	cy.findByRole('heading', {name:`Welcome ${user}`}).should('exist')
})

Cypress.Commands.add('fillSignInForm',(user, password)=>{

	cy.findByLabelText(/email address/i)
	.clear()
	.type(user)
	
	cy.findByLabelText(/password/i)
	.clear()
	.type(password)

	cy.findByRole('main').within(()=>cy.findByRole('button', {name:/sign in/i}).click())
	
})