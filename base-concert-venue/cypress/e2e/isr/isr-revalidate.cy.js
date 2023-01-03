import { generateRandomId } from "../../../lib/features/reservations/utils"
import {generateNewBand} from '../../../__tests__/__mocks__/fakeData/newBand'
import {generateNewShow} from '../../../__tests__/__mocks__/fakeData/newShow'

it('Should load refresedh load from cache after new band is added', ()=>{
	// check if newBand is not on page
	cy
	.task('db:reset')
	.visit('/bands');
	cy.findByRole('heading', {name:/avalanche of cheese/i}).should('not.exist')

	// add new band via post request to api
	const bandId = generateRandomId()
	const newBand = generateNewBand(bandId);
	const secret = Cypress.env("REVALIDATION_SECRET")
	cy.request('POST', `/api/bands?secret=${secret}`, {newBand})
	.then((res)=>{
		// muda a sintaze do do assert, sabe-se lá pq
		expect(res.body.revalidated).to.equal(true)
	})

	//reload the page and see if new band is there
	cy.reload()
	cy.findByRole('heading', {name:/avalanche of cheese/i}).should('exist')

	//reset ISR cache
	cy.resetDbAndClearISRCache('/bands')
})

it('Should load refresedh load from cache after new show is added', ()=>{
	// check if newBand is not on page
	cy
	.task('db:reset')
	.visit('/shows');
	cy.findAllByText(/2002 apr 1[456]/i).should('have.length.of', 3)

	// add new band via post request to api
	const showId = generateRandomId()
	const newShow = generateNewShow(showId);
	const secret = Cypress.env("REVALIDATION_SECRET")
	cy.request('POST', `/api/shows?secret=${secret}`, {newShow})
	.then((res)=>{
		// muda a sintaze do do assert, sabe-se lá pq
		expect(res.body.revalidated).to.equal(true)
	})

	//reload the page and see if new band is there
	cy.reload()
	cy.findAllByText(/2002 apr 1[45678]/i).should('have.length.of', 4)

	//reset ISR cache
	cy.resetDbAndClearISRCache('/shows')
})