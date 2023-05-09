import mongoose from "mongoose"

const Tokenschema = mongoose.Schema({
    loginToken: {
        type: String,
    },
    RegisterToken: {
        type: String,
    },
    ResetPasswordToken: {
        type: String,
    }
}, {
    timestamps: true
})

const Token = mongoose.model('Tokens', Tokenschema )

module.exports = Token; // remember check export with s // if not s , show error 