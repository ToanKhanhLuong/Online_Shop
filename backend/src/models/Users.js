import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  user_name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  resetOtp: {
    type: String,
    default: null
  },
  resetOtpExpiry: {
    type: Date,
    default: null
  },
  address: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    default: 'active'
  },
  role_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: false // Có thể null hoặc trỏ tới một role cụ thể
  }
}, {
  timestamps: true,
  collection: 'users' // Đồng bộ với tên collection 'users'
})

export const User = mongoose.model('User', userSchema)