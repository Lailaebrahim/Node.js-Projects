import app from "./app.js";
import DatabaseClient from "./utils/dbClient.js";

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION!!!\nShutting Down");
  console.log(err);
  process.exit(1);
});


const PORT = process.env.PORT;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  const dbClient = new DatabaseClient(String(process.env.DB));
  dbClient.connect();
});

process.on("unhandledRejection", (err: any) => {
  console.log(err);
  server.close(() => {
    console.log("UNHANDLED REJECTION!!!\nShutting Down");
    process.exit(1);
  });
});
