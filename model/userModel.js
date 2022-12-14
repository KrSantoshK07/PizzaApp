const { default: mongoose } = require('mongoose')
const model = require('mongoose')

const userModel = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model("user", userModel)