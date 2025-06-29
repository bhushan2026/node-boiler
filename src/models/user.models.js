import mongoose, { Schema } from "mongoose";


const UserSchema = new Schema(
    {
        username:{
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        email:{
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        fullName:{
            type: String,
            required: true,
            trim: true,
        },
        password:{
            type: String,
            required: [true, 'Password is required']
        },
        role:{
            type: String,
            enum: ['User', 'Admin'],
            default: 'User'
        },
        mobileNo:{
            type: String,
            required: true,
            unique: true
        }
    },
    {
        timestamps: true
    }
)


export const User = mongoose.model("User", UserSchema);