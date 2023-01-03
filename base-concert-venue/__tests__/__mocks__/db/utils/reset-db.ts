import { readFakeData } from "@/__tests__/__mocks__/fakeData";
import { filenames,  writeJSONToFile} from "@/lib/db/db-utils";

export const resetDB = async () =>{
 	const safeReset = process.env.NODE_ENV === 'test' || process.env.CYPRESS;
	if(!safeReset){
		console.log('WARNING: database reset is unavailable outside test environment!');
		return;
	}

	// Ovoerrite data in files
	const {fakeShows, fakeBands, fakeUsers, fakeReservations} = await readFakeData();
	await Promise.all([
		writeJSONToFile(filenames.bands, fakeBands),
		writeJSONToFile(filenames.shows, fakeShows),
		writeJSONToFile(filenames.reservations, fakeReservations),
		writeJSONToFile(filenames.users, fakeUsers)
	]);
}