import {render, screen} from '@testing-library/react'
import Home from '@/pages'

// Teste de página estática, testando o título do cabaçalho e a imagem de fundo

test('Home page should have the correct heading and background image',()=>{
	render(<Home />);
	const heading = screen.getByRole("heading", {name:/Welcome to Popular Concert Venue/i});
	const image = screen.getByRole("img", {name:/Concert goer with hands in the shape of a heart/i})
	// screen.debug();
	expect(heading).toBeInTheDocument();
	expect(image).toBeInTheDocument();
});