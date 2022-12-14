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
            res.render('register', { errMsg: "Please give infomation in right way!" })
        }
    }
}

async function activateAcc(req, res) {
    let id = req.params.id;
    await userModel.updateOne({ _id: id }, { $set: { status: true } })
        .then(data => {
            res.render('activate', {
                name: data.name
            })
        })
        .catch(err => {
            res.send("Some Thing Went Wrong")
        })
}

var session;
var data;
async function login_post(req, res) {
    var { email, pass } = req.body;

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
                            // req.session.user_id = data._id;
                            // res.render('welcome')
                            // res.redirect('/user/dashboard')
                            res.redirect(`/user/dashboard/${data.id}`)
                            // return res.redirect('/user/dashboard')
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

function addcart(req, res) {
    var { id, name, price, image } = req.body;
    // const uid = req.params.id;
    // res.send(image)
    userOrder.create({ user_id: id, name: name, price: price, image: image })
        .then(data => {
            res.render('dashboard', {
                id: data.user_id,
                name: data.name,
                price: data.price,
                image: '/static/images/' + data.image
            })
        })
        .catch((error) => {
            res.render('dashboard', { errMsg: "Something went wrong!!!!!!!" })
        })
}

async function addcart_get(req, res) {
    const id = req.params.id;
    await userOrder.findOne({ user_id: id })
        .then(data => {
            // res.render('cart', { item: data.map(data => data.toJSON()) })
            res.render('cart', {
                // data: data,
                name: data.name,
                price: data.price,
                image: '/static/images/' + data.image
            })
        })
    // .catch((err) => {
    //     res.render('dashboard', { errMsg: "Something went wrong" })
    // })
    // res.send(id)
}

// function getAllProduct(req, res) {
//     proModel.find({}, (err, data) => {
//         console.log(data);
//         res.render('dashboard', {
//             // pdata: data.map(data => data.toJSON())
//             pdata: data
//         })
//     })
// }

// async function getAllProduct(req, res) {
//     try {
//         const data = await proModel.find();
//         res.status(200).json(data)
//     }
//     catch (error) {
//         res.status(400).json({ "message": error.message })
//     }
// }

function getAllProduct(req, res) {
    proModel.find({}, (err, data) => {
        if (err) { res.send("Something went wrong") }
        else {
            res.render('dashboard', { data: data.map(data => data.toJSON()) })
        }
    })
}

async function getCart(req, res) {
    const uid = req.params.id;
    // res.write(`<script>alert("Data added")</script>;<script>location.assign("/user/dashboard/:id")</script>;`);
    var { name, price, image } = req.body;
    console.log(uid);
    await orderModel.create({ user_id: uid, name: name, price: price, image: image })
        .then(data => {
            res.write(`<script>alert("Data added")</script>;<script>location.assign("/user/dashboard/:id")</script>;`);
            res.render('cart')
        })
        .catch(err => {
            console.log('catch part.......................................');
            res.redirect(`/user/dashboard/${{ uid }}`);
        })
}

module.exports = { signup_post, activateAcc, login_post, addcart, addcart_get, getAllProduct, getCart }