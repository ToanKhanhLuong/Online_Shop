
import { MongoClient, ServerApiVersion } from 'mongodb'
import mongoose from 'mongoose'
import { env } from './environment'


let BookManagementInstance = null

// Khởi tạo một đối tượng Clien Instance để connect tới MongoDB
const mongoClienInstance = new MongoClient(env.MONGODB_URI, {
    serverApi:{
        version : ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
    }
})

export const CONNECT_DB = async () =>{
    
    // Gọi kết nối tới MongoDB Atlas với URI đã khai báo trong thân của clienInstance
    
    await mongoClienInstance.connect()


    // kết nối thanh công thì lấy ra database theo tên và gán ngược lại biến ở trên tên của database
    BookManagementInstance = mongoClienInstance.db(env.DATABASE_NAME)

    // Kết nối Mongoose
    const mongooseUri = env.MONGODB_URI.endsWith('/') ? `${env.MONGODB_URI}${env.DATABASE_NAME}` : `${env.MONGODB_URI}/${env.DATABASE_NAME}`
    await mongoose.connect(mongooseUri)
}

// Đóng kết nối khi cần
export const CLOSE_DB = async () =>{
    await mongoClienInstance.close()
    await mongoose.disconnect()
}

// Function GET_DB (không async) này có nhiệm vụ export ra cái Trello Database Instance sau khi đã connect thành công tới MongoDB để chúng ta sử dụng ở nhiều nơi khác nhau trong code.
// Lưu ý phải đam bảo chỉ luôn gọi cái getDB này sau khi đã kết noi thành công tới MongoDB
export const GET_DB = () =>{
    if(!BookManagementInstance) throw new Error('Must connect to db first');
    return BookManagementInstance
}

