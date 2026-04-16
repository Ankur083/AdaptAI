import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'


dotenv.config({
    path: './.env'
})

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
     
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


// Routes import
import userRouter from './routes/user.routes.js'
import geminiRouter from './routes/gemini.routes.js'

// routes declaration

app.use("/api/v1/user", userRouter);
app.use("/api/v1/gemini", geminiRouter);


// http://localhost:8000/api/v1/users/register


export {app}