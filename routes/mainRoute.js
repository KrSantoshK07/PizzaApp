const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('home')
});

router.get('/pizzas', (req, res) => {
    res.render('pizzas')
})

module.exports = router