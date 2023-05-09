import mongoose from "mongoose";

const contentSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
        },
        title: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        },
        tags: {
            type: [String],
            maxlength: 5
        },
        likes: {
            type: Number,
            default: 0
        },
        likedBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User' 
            }
        ],
        postImage: {
            type: String
        },
        option: {
            type: String
        }
    }
);

contentSchema.statics.findByContent = function (title) {
    return this.where({ title: new RegExp(title, 'i')})
}

const content = mongoose.model('content', contentSchema);

module.exports = content;

//error with contents Note: (0 , _postModel.default) is not a function
// solution https://stackoverflow.com/questions/36733336/error-mongoose-model-is-not-a-function
// change postModel,js ( module.export = content; ) error cuz no `s` ( module.exports = content; )