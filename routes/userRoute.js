const express = require('express');
const router = express.Router();
const { signup_post,
    activateAcc,
    login_post,
    getAllProduct,
    addtoCart,
    getCartItem,
    checkout,
    orderDone,
    removeItem,
    logout,
    profile
} = require('../controller/userControl');

const app = express();
const sessions = require('express-session')
const cookieParser = require("cookie-parser");
const userOrder = require('../model/userOrder');
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

router.get('/dashboard/:id', getAllProduct)

router.post('/addtocart/:id', addtoCart);

router.get('/cart/:id', getCartItem);

router.get('/checkout/:id', (req, res) => {
    const uid = req.params.id
    res.render('checkout')
});
router.post('/checkout/:id', checkout);

router.post('/orderdone/:id', orderDone);

router.post('/remove/:id', removeItem)

router.get('/logout', logout);

router.get('/profile/:id', profile)

module.exports = router