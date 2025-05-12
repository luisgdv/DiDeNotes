//controller that manages various user-related endpoints

const User = require('../models/users');
const { sendEmail } = require('../utils/handleEmail');
const { generateToken } = require('../utils/handleJwt');

exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            email: user.email,
            name: user.persona.name,
            surname: user.persona.surname,
            nif: user.persona.nif,
            status: user.status,
            role: user.role
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtenaining data' });
    }
};

exports.deleteUser = async (req, res) => {
    const { soft } = req.query; 

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (soft === 'false') {
            await user.deleteOne();
            return res.status(200).json({ message: 'User permanently deleted' });
        } else {
            user.status = 'inactive';
            await user.save();
            return res.status(200).json({ message: 'User inactive' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting user' });
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const resetToken = generateToken(user);

        const emailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Password Recovery',
            text: `click on the next link to recover your password: http://localhost:3000/forgotpassword/${resetToken}`
        };

        await sendEmail(emailOptions);

        res.status(200).json({ message: 'A recovery password was sent to your mail' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Link error' });
    }
};

exports.inviteUser = async (req, res) => {
    const { email } = req.body;
    //const { _id } = req.user;
    const invitadoId = req.user._id;

    try {
        /* const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        } */
        if (!req.body.email) {
            return res.status(400).json({ message: 'Email required' });
            }

        const invitedUser = await User.create({
            email,
            role: 'Jhon Doe', 
            password: 'user1234',
        });

        const inviter = await User.findById(invitadoId);
        if (inviter && inviter.company) {
            invitedUser.company = inviter.company;  
            await invitedUser.save();
        }

        const emailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Invitation',
            text: `U've been invited to join!`
        };

        await sendEmail(emailOptions);

        res.status(201).json({
            message: 'Usuario correctly invited',
            user: invitedUser,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'user invited correctly', error: error.message });
    }
};
