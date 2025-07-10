import mongoose from 'mongoose'
import { MONGO_URI } from '../constants/env.js'

export const dbConnect = async () => {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('✅ MongoDB connected')
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}