import express from 'express'
import 'dotenv/config'
import connectDB from './src/config/db.js'
import userRoutes from './src/routes/userRoutes.js'
import leaveRoutes from './src/routes/leaveRoutes.js'
const app = express()
const PORT = process.env.PORT

connectDB()
app.use(express.json())
app.use('/api/users/', userRoutes)
app.use('/api/leaves', leaveRoutes )


app.get('/', (req, res)=>res.send("Test server"))


app.listen(PORT, ()=>console.log(`Server is runnig on ${PORT}`))