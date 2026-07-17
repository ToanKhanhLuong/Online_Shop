import mongoose from 'mongoose'

const roleSchema = new mongoose.Schema({
  role_name: {
    type: String,
    required: true,
    unique: true
  }
}, {
  timestamps: true,
  collection: 'roles' // Đảm bảo trùng khớp với collection 'roles' trong MongoDB
})

export const Role = mongoose.model('Role', roleSchema)
