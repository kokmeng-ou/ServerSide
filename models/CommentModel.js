import mongoose from "mongoose"
const commentSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId, 
            require:true,
            ref: "users" 
        },        
        content: { 
            type: mongoose.Schema.Types.ObjectId, 
            require:true,
            ref: "contents" 
        },
        text: { 
            type: String, 
            required: true 
        },
    }
)

const comment = mongoose.model('comments', commentSchema);

module.exports = comment;