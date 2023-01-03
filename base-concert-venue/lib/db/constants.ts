export const venueCapacity = 400;

// this will eventually use environment variables
export const getDbPath = (): string =>{
	if(!process.env.DB_PATH){
		console.log(`************* ${process.env.DB_PATH} ************`)
		throw new Error('Missing process.env.DB_PATH');
	} else{
		return process.env.DB_PATH;
	}
};
