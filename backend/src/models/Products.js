import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    product_name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
    },
    product_quantity: {
      type: Number,
      required: true,
    },
    image: {
      type: String, // Lưu URL hoặc đường dẫn ảnh
      required: true,
    },
    status: {
      type: String,
      default: "active", // active, inactive
    },
  },
  {
    timestamps: true,
    collection: "products", // Trỏ khớp với collection 'products' trong MongoDB
  },
);

export const Product = mongoose.model("Product", productSchema);
