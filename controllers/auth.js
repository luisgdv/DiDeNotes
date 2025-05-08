const User = require('../models/users');
const { hashPassword } = require('../utils/handlePassword');
const { generateToken } = require('../utils/handleJwt');
//const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/handleEmail');
const { comparePassword } = require('../utils/handlePassword');

exports.registerUser = async (req, res) => {
    try {
        /* const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        } */

        const { email, password } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(409).json({ message: 'EEmail is already in use' });
        }

        const hashedPassword = await hashPassword(password);
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        const user = await User.create({
            email,
            password: hashedPassword,
            verificationCode
        });

        const emailOptions = {
            from: process.env.EMAIL, 
            to: email, 
            subject: 'Verification code',
            text: `Your verification code is: ${verificationCode}`
        };

        await sendEmail(emailOptions);
        const token = generateToken(user);

        res.status(201).json({
            token,
            user: {
                email: user.email,
                status: user.status,
                role: user.role,
                _id: user._id
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.validateEmail = async (req, res) => {
    const { code } = req.body; 
  
    /* if (!code) {
      return res.status(400).json({ message: 'El código de verificación es requerido' });
    } */
  
    try {
      const decoded = jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET);
      const userId = decoded.id;
  
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      if (user.verificationCode === code) {
        user.status = 'verified';
        await user.save();
  
        res.status(200).json({ message: 'Email succesfully validated' });
      } else {
        return res.status(400).json({ message: 'Incorrect validation code' });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Email Validation error' });
    }
};

exports.loginUser = async (req, res) => {
  try {
      /* const errors = validationResult(req);
      if (!errors.isEmpty()) {
          return res.status(422).json({ errors: errors.array() });
      } */

      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
          return res.status(400).json({ message: 'Incorrect credentials' });
      }

      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
          return res.status(400).json({ message: 'Incorrect credentials' });
      }

      const token = generateToken(user);
      res.status(200).json({
          token,
          user: {
              email: user.email,
              status: user.status,
              role: user.role,
              _id: user._id
          }
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
  }
};