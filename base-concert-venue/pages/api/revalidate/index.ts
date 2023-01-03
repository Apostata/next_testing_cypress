import { NextApiResponse } from 'next';
import { NextApiRequest } from 'next';
import { createHandler } from "@/lib/api/handler";

const handler = createHandler();
handler.get(async(req: NextApiRequest, res:NextApiResponse)=>{
	if(process.env.APP_ENV !== "test"){
		return res.status(401).json('endpoint only available for test use');
	}

	if(req.query.secret !== process.env.REVALIDATION_SECRET){
		return res.status(401).json('invalid revalidation secret');
	}
	if(!req.query.route){
		return res.status(401).json('invalid route');
	}

	// await res.revalidate('/shows')
	// await res.revalidate('/bands')
	await res.revalidate(req.query.route as string)
	return res.status(200).end();
});
export default handler;