it('should load shows page data from cache', ()=>{
	cy.request('/shows')
	.its('body')
	.then(html=>{
		// remove client scripts
		const staticHTML = html.replace(/<script.*?>.*?<\/script>/gm, '')
		cy.state('document').write(staticHTML)
	})

	cy.findAllByText(/2002 apr 1[456]/i).should('have.length.of', 3)
})
