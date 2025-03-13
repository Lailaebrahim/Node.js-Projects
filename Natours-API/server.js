import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app.js";

// handle uncaught exceptions from everywhere in the app by listening to the uncaughtException event 
// that is emitted when an uncaught JavaScript exception occurs
process.on("uncaughtException", err => {
    console.log("UNCAUGHT EXCEPTION! Shutting down...");
    console.log(err.name, err.message);
    process.exit(1);
})

dotenv.config();
const DB = process.env.DATABASE.replace(
    "<PASSWORD>",
    process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => console.log("DB connection successful!"));


const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});

// handle unhandled promise rejections from everywhere in the app by listening to the unhandledRejection event
// that is emitted when a promise is rejected but there is no catch handler to deal with the rejection
process.on("unhandledRejection", err => {
    console.log("UNHANDLED REJECTION! Shutting down...");
    console.log(err.name, err.message);
    server.close(() => process.exit(1));
});