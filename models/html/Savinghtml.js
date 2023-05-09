import mongoose from "mongoose"

const SavingHTMLSchema = mongoose.Schema(
    {
        title: {
            type: String
        },
        router: {
            type: String
        },
        savingHTML: {
            type: String
        }
    }
)


const attribute = mongoose.model('SavingHTML', SavingHTMLSchema)

module.exports = attribute