const { default: mongoose } = require('mongoose')
const model = require('mongoose')

const orderModel = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model("order", orderModel)