import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    cpassword: string;
    isValidPassword(password: string): Promise<boolean>; 
}

const Userdata: Schema<IUser> = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    cpassword: {
        type: String,
        required: true,
    },
});

Userdata.pre<IUser>('save', async function (next) {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashpass = await bcrypt.hash(this.password, salt);
        const chashpass = await bcrypt.hash(this.cpassword, salt);
        this.password = hashpass;
        this.cpassword = chashpass;
        next();
    } catch (error:any) {
        next(error);
    }
});

Userdata.methods.isValidPassword = async function (password: string): Promise<boolean> {
    try {
        return await bcrypt.compare(password, this.password);
    } catch (error:any) {
        throw error;
    }
};

// Create and export the model
const Users = mongoose.model<IUser>('Users', Userdata);
export default Users;
