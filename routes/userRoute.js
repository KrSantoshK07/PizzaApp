const express = require('express');
const router = express.Router();
const { signup_post, activateAcc, login_post, addcart, addcart_get, getAllProduct, getCart } = require('../controller/userControl');

const app = express();
const sessions = require('express-session')
const cookieParser = require("cookie-parser");
const userOrder = require('../model/userOrder');
// const { getAllProduct } = require('../../Mongoose_Assign_4/controllers/controller');
app.use(cookieParser());

const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: true
}));

router.get('/signup', (req, res) => {
    res.render('signup');
})

router.post('/signup_post', signup_post);

router.get('/activateacc/:id', activateAcc);

router.get('/login', (req, res) => {
    res.render('login')
})

router.post('/login_post', login_post);

router.get('/welcome', (req, res) => [
    res.render('welcome')
])

// router.get('/dashboard/:id', async (req, res) => {
//     const id = req.params.id;
//     var { name, price, image } = req.body;
//     await userOrder.findOne({ user_id: id })
//         .then(data => {
//             // console.log(data.id);

//             res.render('dashboard', {
//                 id: id,
//                 name: name,
//                 price: price,
//                 image: image
//             })
//         })
//         .catch((err) => {
//             res.render('dashboard', { errMsg: "something went wrong...." })
//         })
// })

// router.get('/dashboard', (req, res) => {
//     res.redirect('/user/dashboard')
// })

router.get('/dashboard/:id', getAllProduct)

router.get('/cart/:id', getCart)

// router.get('/cart/:id', addcart_get)


router.get('/checkout', (req, res) => {
    res.render('checkout')
})

router.post('/addcart_get', addcart)



module.exports = router