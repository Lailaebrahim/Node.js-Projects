import mongoose from "mongoose";

class DatabaseClient {
    private DB: string;

    constructor(db: string) {
        this.DB = db;
    }

    async connect(): Promise<void> {
        try {
            const connection = await mongoose.connect(this.DB);
            console.log(
                "Database connection successful",
                connection.connections[0].name
            );
        } catch (error) {
            console.error("Database connection error:", error);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        try{
            await mongoose.disconnect();
            console.log("Database disconnected successfully.");
        } catch (error) {
            console.error("Error disconnecting from the database:", error);
            throw error;
        }
    }
}

export default DatabaseClient;