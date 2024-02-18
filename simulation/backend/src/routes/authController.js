const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');

exports.register = async (req, res) => {
    const { username, email, password } = req.body; 
    try{
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        } 

        user = new User({
            username,
            email,
            password
        });
        await user.save();
        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });
        res.status(201).json({ token });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body; 
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};


