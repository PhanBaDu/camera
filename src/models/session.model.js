import mongoose from 'mongoose'
import { thirtyDaysFromNow } from '../ultis/date.js'

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  userAgent: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true,
    default: thirtyDaysFromNow
  }
})

const Session = mongoose.model('Session', sessionSchema)

export default Session
