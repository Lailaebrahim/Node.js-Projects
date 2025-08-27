import { Document } from "mongoose";

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "admin" | "user";
  photo?: string | null;
  passwordChangeAt?: Date | null;
  passwordResetToken?: string | null;
  passwordResetExpires?: Date | null;
  active?: Boolean | null;
  
  validatePassword(candidatePassword: string): Promise<boolean>;
  changedPasswordAfter(JWTTimestamp: number): boolean;
  resetPasswordToken(): string;
}

export default IUser;
