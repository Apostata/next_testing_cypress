import {generateRandomId} from '../../../lib/features/reservations/utils'
import {generateNewBand} from '../../../__tests__/__mocks__/fakeData/newBand.ts'

it('Should displays correct heading when navigation to show route',()=>{
	cy.visit('/');
	cy.findByRole("button", {name:/shows/i}).click();
	cy.findByRole('heading', {name:/upcoming shows/i}).should('exist');
});

it('Should display correct heading when navigating to bands route', ()=>{
	cy.visit('/');
	cy.findByRole("button", {name:/bands/i}).click();
	cy.findByRole('heading', {name:/our illustrious performers/i}).should('exist');
});

it('Should display the corret band name for band route that existed at build time', ()=>{
	cy.task('db:reset').visit('/bands/1'); // reset db
	cy.findByRole('heading', {name:/Shamrock Pete/i}).should('exist')
	
});

it('Should display if that there is no band for the given route at build time', ()=>{
	cy.task('db:reset').visit('/bands/12345')
	cy.findByRole('heading', {name:/Could not retrieve band data: Error: band not found/i}).should('exist')
});

it('Should add a new band there is not present at build time an teste if there is created route in run time',()=>{
	const bandId = generateRandomId()
	const newBand = generateNewBand(bandId)
	cy.task('db:reset').task('band:add', newBand)
	cy.visit(`/bands/${bandId}`)
})

// it('should reset de DB', ()=>{
// 	cy.task('db:reset');
// });