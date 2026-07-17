import express from 'express'
import { authRoutes } from './authRoutes'
import { productRoutes } from './productRoutes'

const Router = express.Router()

// Sử dụng tuyến đường auth
Router.use('/auth', authRoutes)

// Sử dụng tuyến đường products
Router.use('/products', productRoutes)

export const APIs_V1 = Router
