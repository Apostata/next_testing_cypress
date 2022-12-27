import {getByText, render, screen} from '@testing-library/react';
import BandPage from '@/pages/bands/[bandId]';
import {readFakeData} from '@/__tests__/__mocks__/fakeData'

test('Should show the correct band information with given ID', async ()=>{
	const {fakeBands} = await readFakeData()
	render(<BandPage band={fakeBands[0]} error={null}/>);

	const headding = screen.getByRole('heading', {name:/the wandering bunnies/i});
	const description = screen.getByText(/blistering world music, supported by a moody water glass orchestra/i);
	const image = screen.getByRole('img', {name:/the wandering bunnies/i})
	const photoBy = screen.getByRole('link', {name:/Adina Voicu/i})

	expect(headding).toBeInTheDocument();
	expect(description).toBeInTheDocument();
	expect(image).toBeInTheDocument();
	expect(photoBy).toBeInTheDocument();
});

test('Should not show error message when error is passed to document', async ()=>{
	const {fakeBands} = await readFakeData()
	render(<BandPage band={fakeBands[1]} error={'Teste de erro'}/>);
	const headdingError = screen.getByRole('heading', {name:/Could not retrieve band data: Teste de erro/i});
	expect(headdingError).toBeInTheDocument();
});

test('Should show loading spinner when ther is no band or/and no error', async ()=>{
	render(<BandPage band={null} error={null}/>);
	const loading = screen.getByText(/Loading.../i);
	expect(loading).toBeInTheDocument();
});