const roleMiddleware = (...roles)=>{
    return (req, res, next)=>{
        if(!roles.includes(req.user.role)){
            return res.status(400).json({message: "You are not allowed to access"})
        }
        next()
    }
}

export default roleMiddleware