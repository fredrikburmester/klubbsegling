const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
const User = require("../models/user");
const jwt = require('jsonwebtoken');

const config = require('../config');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
  extended: true
}));

router.post('/login', (req, res) => {
    const {
        username,
        password 
    } = req.body

    User.findOne({email:username}, (err, user) => {
        if (err) return res.status(500).send('Error on the server.');
        if (!user) return res.status(404).send('No user found.');
        let passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });
        let token = jwt.sign({ id: user._id }, config.secret, { expiresIn: 86400 // expires in 24 hours
        });
        // if(user.adminLevel == 5) var is_admin = true
        res.status(200).send({ auth: true, token: token, user: user, is_admin: (user.adminLevel == 5)  });
    })
})

module.exports = router;