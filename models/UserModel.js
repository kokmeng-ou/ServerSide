import mongoose from "mongoose"

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username Require"]
    },
    email: {
        type: String,
        required: [true, "EmailAddress Require"],
        lowercase: true,
        unique: true
    },
    password: {
        type: String,
        required: [true, "Password Require"],
    },
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }],
    post: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "posts"
    }],
    weblink: {
        type: String
    },
    age: {
        type: Number
    },
    telephone: {
        type: Number
    },
    UserImage: {
        type: String
    },
    Location: {
        type: String
    },
    Bio: {
        type: String
    },
    loginToken: { 
        type: String 
    },
    resetToken: {
        type: String
    }
}, {
    timestamps: true
})

const users = mongoose.model('users', userSchema )

module.exports = users; // remember check export with s // if not s , show error 