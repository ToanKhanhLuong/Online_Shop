import express from 'express'
import { productController } from '../../controllers/productController'
import { authMiddleware } from '../../middlewares/authMiddleware'
import { adminMiddleware } from '../../middlewares/adminMiddleware'

const Router = express.Router()

// Lấy danh sách sản phẩm (Yêu cầu xác thực JWT)
Router.get('/', authMiddleware, productController.getProducts)

// Lấy chi tiết sản phẩm (Yêu cầu xác thực JWT)
Router.get('/:id', authMiddleware, productController.getProductDetail)

// Thêm sản phẩm mới (Yêu cầu Admin)
Router.post('/', authMiddleware, adminMiddleware, productController.createProduct)

// Sửa sản phẩm (Yêu cầu Admin)
Router.put('/:id', authMiddleware, adminMiddleware, productController.updateProduct)

// Xóa sản phẩm (Yêu cầu Admin)
Router.delete('/:id', authMiddleware, adminMiddleware, productController.deleteProduct)

export const productRoutes = Router
