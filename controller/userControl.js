const userModel = require('../model/userModel')
const orderModel = require('../model/userOrder')
const proModel = require('../model/products')
const model = require('mongoose')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const hbs = require('nodemailer-express-handlebars')
const dotenv = require('dotenv').config();
const saltrounds = 10;

const userOrder = require('../model/userOrder');
const product = require('../../Mongoose_Assign_4/model/product')
const cart = require('../model/cart')

let transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    secure: false,
    auth: {
        user: "krrsantosh0@gmail.com",
        pass: "igbulwujgpsydnrt"
    }
});

transporter.use('compile', hbs(
    {
        viewEngine: 'nodemailer-express-handlebars',
        viewPath: 'template'
    }
))

const regName = new RegExp(/^([a-zA-Z ]){2,30}$/);
const regMail = new RegExp(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/);
const regPass = new RegExp(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/);
const regAddress = new RegExp(/^([a-zA-Z ]){2,30}$/);
const regContact = new RegExp("^[7-9][0-9]{9}$");

function signup_post(req, res) {
    var { name, email, pass, cpass, address, contact } = req.body

    name = name.toString().trim();
    email = email.toString().trim();
    pass = pass.toString().trim();
    cpass = cpass.toString().trim();
    address = address.toString().trim();
    contact = contact.toString().trim();

    if (name == '' || email == '' || pass == '' || cpass == '' || address == '' || contact == '') {
        res.render('signup', { errMsg: "Fields are missing!" })
    } else {
        if (regName.test(name) && regMail.test(email) && regPass.test(pass) && regPass.test(cpass) && regAddress.test(address) && regContact.test(contact)) {
            if (pass == cpass) {
                let hash = bcrypt.hashSync(pass, saltrounds)
                userModel.create({ name: name, email: email, password: hash, address: address, contact: contact })
                    .then(data => {
                        let mailOptions = {
                            from: 'krrsantosh0@gmail.com',
                            to: email,
                            subject: "Activation mail",
                            template: 'mail',
                            context: {
                                name: data.name,
                                id: data._id
                            }
                        }
                        transporter.sendMail(mailOptions, (err, info) => {
                            if (err) { console.log(err) }
                            else {
                                console.log("Mail sent : " + info)
                                res.redirect("/user/login")
                            }
                        })
                    })
                    .catch((err) => {
                        res.render("signup", { errMsg: "User Already Registered" })
                    })
            } else {
                res.render('signup', { errMsg: "Passwords not matched!" })
            }
        } else {
            res.render('signup', { errMsg: "Please give infomation in right way!" })
        }
    }
}

async function activateAcc(req, res) {
    let id = req.params.id;
    await userModel.updateOne({ _id: id }, { $set: { status: true } })
        .then(data => {
            userModel.findOne({ _id: id })
                .then(data1 => {
                    res.render('activate', { name: data1.name })
                })
        })
        .catch(err => {
            res.send("Some Thing Went Wrong")
        })
}

async function login_post(req, res) {
    var { email, pass } = req.body;
    // console.log(session);

    email = email.toString().trim();
    pass = pass.toString().trim();

    if (email == '' || pass == '') {
        res.render('login', { errMsg: "Fields are missing!" })
    } else {
        if (regMail.test(email) && regPass.test(pass)) {
            await userModel.findOne({ email: email })
                .then(data => {
                    if (data.status == true) {
                        if (bcrypt.compareSync(pass, data.password)) {
                            session = req.session;
                            session.email = email;

                            res.redirect(`/user/dashboard/${data.id}`)
                        }
                        else {
                            return res.render("login", { errMsg: "Wrong username or password!" });
                        }
                    } else {

                        res.render('login', { errMsg: "Account not activated!" })
                    }

                })
                .catch(err => {
                    // console.log(data.status)
                    res.render('login', { errMsg: "Data not found!" })
                })
        } else {
            res.render('login', { errMsg: "Incorrect email or password!" })
        }
    }
}

function getAllProduct(req, res) {
    var uid = req.params.id;
    if (uid) {
        proModel.find({}, (err, data) => {
            if (err) { res.send("Something went wrong") }
            else {
                res.render('dashboard', { data: data.map(data => data.toJSON()), userId: uid })
            }
        })
    } else {
        res.render('login');
    }
}

async function addtoCart(req, res) {
    var uid = req.params.id;
    var { pid, name, price, image } = req.body;

    const isData = await cart.findOne({ product_id: pid });
    let isError = true;

    if (isData) {
        const updateisData = await cart.updateOne({ product_id: pid }, { $inc: { quantity: 1 } });
        if (updateisData) {
            isError = false;
        }
    } else {
        const cartObj = { user_id: uid, product_id: pid, name: name, price: price, image: image }
        const insertisData = new cart(cartObj).save();
        if (insertisData) {
            isError = false;
        }
    }
    if (!isError) {
        res.write(`<script>alert("Data added")</script>;<script>location.assign("/user/dashboard/${uid}")</script>;`);
        // res.redirect(`/user/dashboard/${uid}`)
        // res.render('dashboard', { uid: uid, succMsg: "Item added" })
    } else {
        res.write(`<script>alert("Something went wrong")</script>;<script>location.assign("/user/dashboard/${uid}")</script>;`);
    }
}

async function getCartItem(req, res) {
    const uid = req.params.id
    await cart.find({ user_id: uid })
        .then(data => {
            var total = 0;
            data.map((element) => {
                total = total + (element.quantity * element.price)
            })
            res.render('cart', { data: data.map(data => data.toJSON()), userId: uid, total: total })
        })
}

async function checkout(req, res) {
    const uid = req.params.id;
    var total = req.body.total;

    cart.find({ user_id: uid })
        .then(data => {
            var total = 0;
            data.map((element) => {
                total = total + (element.quantity * element.price)
            })
            res.render('checkout', { userId: uid, total: total })
        })
}

function orderDone(req, res) {
    var cardnumber = req.body.card;
    const uid = req.params.id;
    const regCardNum = new RegExp("^[7-9][0-9]{15}$");

    if (cardnumber == '') {
        cart.find({ user_id: uid })
            .then(data => {
                var total = 0;
                data.map((element) => {
                    total = total + (element.quantity * element.price)
                })
                res.render('checkout', { userId: uid, total: total, errMsg: "Field missing!" })
            })
    } else {
        if (regCardNum.test(cardnumber)) {
            res.render('orderdone', { userId: uid });
        }
    }
}

function removeItem(req, res) {
    const uid = req.params.id;
    var pid = req.body.pid;
    cart.deleteOne({ _id: pid })
        .then(data => {
            cart.find({ user_id: uid })
                .then(data => {
                    var total = 0;
                    data.map((element) => {
                        total = total + (element.quantity * element.price)
                    })
                    res.render('cart', { data: data.map(data => data.toJSON()), userId: uid, total: total })
                })
        })
        .catch(error => {
            res.render('cart', { errMsg: "Something went wrong!" })
        })
}

function logout(req, res) {
    req.session.destroy();
    res.render('home');
}

function profile(req, res) {
    const uid = req.params.id;
    userModel.findOne({ uid })
        .then(data => {
            res.render('profile', {
                userId: uid,
                name: data.name,
                email: data.email,
                contact: data.contact,
                address: data.address
            })
        })
}

module.exports = {
    signup_post,
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
}