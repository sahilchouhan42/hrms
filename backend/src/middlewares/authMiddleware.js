import jwt from 'jsonwebtoken'

const authMiddleware = (req, res, next)=>{
    try {
        const authHeader = req.headers.authorization

        //chech token
        if(!authHeader || !authHeader.startsWith("Bearer")){
            return res.status(400).json({message: "Unauthorized access, token is missing"})
        }

        //token
        const token = authHeader.split(' ')[1]

        //verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        //user
        req.user = decoded
        next()
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({message: error.message})
    }
}

export default authMiddleware