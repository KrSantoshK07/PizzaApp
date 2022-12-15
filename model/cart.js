const { default: mongoose } = require('mongoose')
const model = require('mongoose')

const cartModel = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    product_id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        default: 1
    }
})

module.exports = mongoose.model("cart", cartModel)