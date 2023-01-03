module.exports ={
	esModule:true,
	validateToken:jest.fn().mockResolvedValue(true)
}
// to satisfy typescript 
export {}

// using this mock
// jest.mock("@/lib/auth/utils")