import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'

import { dbConnect } from './configs/db.js'
import { APP_ORIGIN, NODE_ENV, PORT } from './constants/env.js'
import { INTERNAL_SERVER_ERROR, LABEL_INTERNAL_SERVER_ERROR } from './constants/http.js'
import authRoutes from './routes/auth.route.js'

const app = express()
app.use(
  cors({
    origin: [APP_ORIGIN],
    credentials: true
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(helmet())
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }))
app.use(morgan('dev'))
app.use(cookieParser())

app.use('/api/auth', authRoutes)

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || INTERNAL_SERVER_ERROR
  const message = err.message || LABEL_INTERNAL_SERVER_ERROR
  res.status(statusCode).json({
    success: false,
    statusCode,
    message
  })
})

app.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT} in ${NODE_ENV} environment`)
  await dbConnect()
})
