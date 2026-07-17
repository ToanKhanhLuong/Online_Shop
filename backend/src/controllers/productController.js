import { Product } from '../models/Products'

export const productController = {
  // Lấy danh sách sản phẩm (Tự động Seed dữ liệu nếu DB trống)
  getProducts: async (req, res) => {
    try {
      const count = await Product.countDocuments()
      
      // Auto seed dữ liệu nếu collection trống
      if (count === 0) {
        await Product.insertMany([
          {
            product_name: 'iPhone 15 Pro Max 256GB',
            description: 'Điện thoại cao cấp nhất của Apple với thiết kế khung Titanium siêu bền nhẹ, màn hình Super Retina XDR 6.7 inch, chip Apple A17 Pro thế hệ mới và cụm camera zoom quang học 5x đột phá mang lại trải nghiệm đỉnh cao.',
            price: 29490000,
            product_quantity: 45,
            image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600',
            status: 'active'
          },
          {
            product_name: 'MacBook Pro 14 M3 8GB/512GB',
            description: 'Máy tính xách tay tối tân trang bị chip Apple M3 hiệu năng mạnh mẽ, hỗ trợ hiển thị tối đa 2 màn hình ngoài, thời lượng pin bền bỉ đến 22 giờ liên tục và màn hình Liquid Retina XDR sắc nét.',
            price: 38990000,
            product_quantity: 20,
            image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600',
            status: 'active'
          },
          {
            product_name: 'iPad Pro 11 M2 Wi-Fi 128GB',
            description: 'Máy tính bảng đỉnh cao hỗ trợ đắc lực công việc sáng tạo với chip M2 cực mạnh, màn hình Liquid Retina tần số quét 120Hz mượt mà cùng khả năng tương thích Apple Pencil 2 di chuột thông minh.',
            price: 20990000,
            product_quantity: 15,
            image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600',
            status: 'active'
          },
          {
            product_name: 'AirPods Pro 2 MagSafe (USB-C)',
            description: 'Tai nghe không dây chống ồn chủ động tốt hơn gấp đôi thế hệ trước. Trang bị chip H2 thông minh, sạc USB-C tiện lợi và thời lượng nghe nhạc lên đến 6 giờ chỉ với một lần sạc.',
            price: 5690000,
            product_quantity: 60,
            image: 'https://images.unsplash.com/photo-1588449668338-d13417f16af7?w=600',
            status: 'active'
          },
          {
            product_name: 'Apple Watch Series 9 GPS 41mm',
            description: 'Đồng hồ thông minh thế hệ mới tích hợp chip S9 SiP tiên tiến, tính năng cử chỉ chạm hai lần (Double Tap) ma thuật không cần chạm màn hình, theo dõi sức khỏe và giấc ngủ nâng cao.',
            price: 9490000,
            product_quantity: 30,
            image: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=600',
            status: 'active'
          },
          {
            product_name: 'Bàn phím Magic Keyboard iPad Pro 11',
            description: 'Bàn phím cơ thiết kế lơ lửng độc đáo cho cảm giác gõ êm ái, tích hợp bàn di chuột Trackpad đa điểm tiện lợi và cổng sạc USB-C pass-through tiện ích cho iPad.',
            price: 7990000,
            product_quantity: 10,
            image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600',
            status: 'active'
          }
        ])
      }

      // Lấy toàn bộ sản phẩm đang kích hoạt
      const products = await Product.find({ status: 'active' }).sort({ createdAt: -1 })
      return res.status(200).json({ products })
    } catch (error) {
      console.error('Lỗi khi lấy danh sách sản phẩm:', error)
      return res.status(500).json({ message: 'Đã xảy ra lỗi trên máy chủ khi lấy danh sách sản phẩm!' })
    }
  },

  // Lấy thông tin chi tiết một sản phẩm
  getProductDetail: async (req, res) => {
    try {
      const { id } = req.params
      const product = await Product.findById(id)

      if (!product || product.status !== 'active') {
        return res.status(404).json({ message: 'Không tìm thấy sản phẩm hoặc sản phẩm đã ngừng kinh doanh!' })
      }

      return res.status(200).json({ product })
    } catch (error) {
      console.error('Lỗi lấy chi tiết sản phẩm:', error)
      return res.status(500).json({ message: 'Đã xảy ra lỗi trên máy chủ khi lấy chi tiết sản phẩm!' })
    }
  },

  // Thêm sản phẩm mới
  createProduct: async (req, res) => {
    try {
      const { product_name, description, price, product_quantity, image } = req.body

      if (!product_name || !price || !product_quantity || !image) {
        return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ: Tên, Giá, Số lượng và Ảnh sản phẩm!' })
      }

      const newProduct = await Product.create({
        product_name,
        description: description || '',
        price,
        product_quantity,
        image,
        status: 'active'
      })

      return res.status(201).json({
        message: 'Thêm sản phẩm mới thành công!',
        product: newProduct
      })
    } catch (error) {
      console.error('Lỗi thêm sản phẩm:', error)
      return res.status(500).json({ message: 'Đã xảy ra lỗi trên máy chủ khi thêm sản phẩm!' })
    }
  },

  // Sửa thông tin sản phẩm
  updateProduct: async (req, res) => {
    try {
      const { id } = req.params
      const { product_name, description, price, product_quantity, image } = req.body

      if (!product_name || !price || !product_quantity || !image) {
        return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ: Tên, Giá, Số lượng và Ảnh sản phẩm!' })
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        { product_name, description, price, product_quantity, image },
        { new: true }
      )

      if (!updatedProduct) {
        return res.status(404).json({ message: 'Không tìm thấy sản phẩm cần cập nhật!' })
      }

      return res.status(200).json({
        message: 'Cập nhật thông tin sản phẩm thành công!',
        product: updatedProduct
      })
    } catch (error) {
      console.error('Lỗi cập nhật sản phẩm:', error)
      return res.status(500).json({ message: 'Đã xảy ra lỗi trên máy chủ khi cập nhật sản phẩm!' })
    }
  },

  // Xóa sản phẩm (Xóa cứng khỏi DB)
  deleteProduct: async (req, res) => {
    try {
      const { id } = req.params
      const deletedProduct = await Product.findByIdAndDelete(id)

      if (!deletedProduct) {
        return res.status(404).json({ message: 'Không tìm thấy sản phẩm cần xóa!' })
      }

      return res.status(200).json({
        message: 'Xóa sản phẩm thành công!'
      })
    } catch (error) {
      console.error('Lỗi xóa sản phẩm:', error)
      return res.status(500).json({ message: 'Đã xảy ra lỗi trên máy chủ khi xóa sản phẩm!' })
    }
  }
}
