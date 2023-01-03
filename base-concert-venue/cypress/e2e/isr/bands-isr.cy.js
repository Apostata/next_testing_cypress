it('should load bands page data from cache', ()=>{
	cy.request('/bands')
	.its('body')
	.then(html =>{
		// remove client scripts
		const staticHTML = html.replace(/<script.*?>.*?<\/script>/gm, '')
		cy.state('document').write(staticHTML)
	});
	cy.findByRole('heading', {name:/the joyous nun riot/i}).should('exist')
	cy.findByRole('heading', {name:/shamrock pete/i}).should('exist')
	cy.findByRole('heading', {name:/the wandering bunnies/i}).should('exist')
})