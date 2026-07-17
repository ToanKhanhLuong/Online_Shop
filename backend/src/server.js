

import express from "express";
import cors from "cors";
import exitHook from "exit-hook";
import { CONNECT_DB, CLOSE_DB } from "./config/mongodb";
import { env } from "./config/environment";
import { APIs_V1 } from "./routes/v1";

const START_SERVER = () => {
  const app = express();

  // Cho phép kết nối CORS từ frontend
  app.use(cors());

  // Đọc dữ liệu JSON từ body request
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Đăng ký API v1
  app.use("/api/v1", APIs_V1);

  app.get("/", async (req, res) => {
    res.end("<h1>Hello World!</h1><hr>");
  });

  app.listen(env.APP_PORT, env.APP_HOST, () => {
    // eslint-disable-next-line no-console
    console.log(
      `Hello ${env.AUTHOR}, I am running at ${env.APP_HOST}:${env.APP_PORT}/`,
    );
  });

  exitHook(() => {
    console.log(`4. Server is Shouldown..`);
    CLOSE_DB();
    console.log(`5. Disconect Mongo cloud Altas`);
  });
};

(async () => {
  try {
    console.log("1.Connected to MongoDB Cloud Atlas!");
    await CONNECT_DB();
    console.log("2.Connected to MongoDB Cloud Atlas!");
    // Khởi động server backend khi kết nối thành công
    START_SERVER();
  } catch (error) {
    console.error(error);
    process.exit(0);
  }
})();


