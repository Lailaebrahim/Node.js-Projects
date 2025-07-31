import app from "./app.js";
import mongoose from "mongoose";

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION!!!\nShutting Down");
  console.log(err);
  process.exit(1);
});

const DB = process.env.DB;
mongoose
  .connect(DB as string)
  .then((connection) => {
    console.log(
      "Database connection successful",
      connection.connections[0].name
    );
  })
  .catch((error) => {
    console.error("Database connection error:", error);
  });

const PORT = process.env.PORT;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

process.on("unhandledRejection", (err: any) => {
  console.log(err);
  server.close(() => {
    console.log("UNHANDLED REJECTION!!!\nShutting Down");
    process.exit(1);
  });
});
