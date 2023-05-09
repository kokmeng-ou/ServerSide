import mongoose from "mongoose"

const SavingCSSSchema = mongoose.Schema(
    {
        title: {
            type: String
        },
        router: {
            type: String
        },
        savingCSS: {
            type: String
        }
    }
)


const attribute = mongoose.model('SavingCSS', SavingCSSSchema)

module.exports = attribute