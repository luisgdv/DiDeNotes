//controller that manages user personal and company data updates

const User = require('../models/users');
//const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

exports.DataPersona = async (req, res) => {
    try {
        /* const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        } */
        const { name, surname, nif } = req.body;
        const { id } = req.user; 

        const user = await User.findById(id);
        //const user = await User.findById(mongoose.Types.ObjectId(id));
        console.log("User:", user);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.persona.name = name || user.persona.name;
        user.persona.surname = surname || user.persona.surname;
        user.persona.nif = nif || user.persona.nif;
        await user.save();

        res.status(200).json({
            message: 'Data succesfully updated',
            user: {
                name: user.persona.name,
                surname: user.persona.surname,
                nif: user.persona.nif
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'error updating personal info' });
    }
};

exports.DataCompany = async (req, res) => {
    const { companyName, cif, address, number, postal, city, province } = req.body;
    const { id } = req.user;
    console.log("ID user:", id); 

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.isAutonomous) {
            user.company = {
                companyName: user.persona.name,
                cif: user.persona.nif,
                address: address, 
                number: number,
                postal: postal,
                city: city,
                province: province
            };
        } else {
            user.company = {
                companyName: companyName,
                cif: cif,
                address: address,
                number: number,
                postal: postal,
                city: city,
                province: province
            };
        }

        await user.save();
        res.status(200).json({
            message: 'Succesfully updated  data',
            user: {
                companyName: user.persona.name,
                cif: user.persona.nif,
                address: user.company.address,
                number: user.company.number,
                postal: user.company.postal,
                city: user.company.city,
                province: user.company.province
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating compannies data', error: err.message });
    }
};
