require('dotenv').config()
const express = require('express');
const app = express();
const exphbs = require('express-handlebars')
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const PORT = 8899;

const flash = require('express-flash')
const sessions = require('express-session')
const oneDay = 1000 * 60 * 60 * 24;

mongoose.set('strictQuery', true);
mongoose.connect(process.env.DATABASE_URL)
// mongoose.connect('mongodb://127.0.0.1:27017/Pizza')
    .then(res => console.log("Database Connected..."))
    .catch(err => console.log("Database error" + err))

const userRoute = require('./routes/userRoute')
const mainRoute = require('./routes/mainRoute')

app.engine('handlebars', exphbs.engine())
app.set('view engine', 'handlebars');
app.set('views', './views');

app.use('/static', express.static('public'));

//session congig
app.use(sessions({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: oneDay }
}))

var session;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', mainRoute)
app.use('/user', userRoute);


// console.log(process.env.SECRET_KEY)
app.listen(PORT, (err) => {
    if (err) throw err;
    else console.log(`Listening PORT at localhost:${PORT}`);
})
