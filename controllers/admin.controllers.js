const User = require("../models/user.model");
const Order = require("../models/order.model");
const Meeting = require("../models/meeting.model");
const Complaint = require("../models/complaint.model");
const Service = require("../models/service.model");
const Student = require("../models/student.model");
const Business = require("../models/business.model");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config({});
const secretKey = process.env.JWT_SECRET;
const bcrypt = require('bcryptjs');


function isPhoneNumber(inputtxt) {
    var phoneno = /^\+?([0-9]{3})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{5})$/;
    var result = false;
    if ((inputtxt.match(phoneno))) {
        result = true;
    }
    else {
        result = false;
    }
    return result;
}

module.exports = {
    //Admin access all orders
    fetchOrders: async (req, res) => {
        let token = req.headers['authorization'];
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) { return res.status(403).json({ "success": false, "message": "Invalid Bearer Token" }); }
            const client = decoded.user;
            User.findOne({ _id: client._id }, (e, user) => {
                if (e) { return res.status(400).json({ "success": false, "message": "Error Fetching User" }); }
                else if (!user) {
                    return res.status(403).json({ "success": false, "message": "User not found" });

                }
                else if (!user.is_admin) {
                    return res.status(403).json({ "success": false, "message": "Invalid access to admin feature" });
                }
                Order.find({}).populate('user').exec((error, result) => {
                    if (error) {
                        return res.status(400).json({ "success": false, "message": "Error Fetching Orders' Data" });
                    }
                    return res.status(200).json({ "success": true, "orders": result });
                })
            })
        })
    },

    fetchComplaints: async (req, res) => {
        let token = req.headers['authorization'];
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) { return res.status(403).json({ "success": false, "message": "Invalid Bearer Token" }); }
            const client = decoded.user;
            User.findOne({ _id: client._id }, (e, user) => {
                if (e) { return res.status(400).json({ "success": false, "message": "Error Fetching User" }); }
                else if (!user) {
                    return res.status(403).json({ "success": false, "message": "User not found" });

                }
                else if (!user.is_admin) {
                    return res.status(403).json({ "success": false, "message": "Invalid access to admin feature" });
                }
                Complaint.find({}).populate('user').populate('order').exec((error, result) => {
                    if (error) {
                        return res.status(400).json({ "success": false, "message": "Error Fetching Orders' Data" });
                    }
                    return res.status(200).json({ "success": true, "complaints": result });
                })
            })
        })
    },

    fetchMeetings: async (req, res) => {
        let token = req.headers['authorization'];
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) { return res.status(403).json({ "success": false, "message": "Invalid Bearer Token" }); }
            const client = decoded.user;
            User.findOne({ _id: client._id }, (e, user) => {
                if (e) { return res.status(400).json({ "success": false, "message": "Error Fetching User" }); }
                else if (!user) {
                    return res.status(403).json({ "success": false, "message": "User not found" });

                }
                else if (!user.is_admin) {
                    return res.status(403).json({ "success": false, "message": "Invalid access to admin feature" });
                }
                Meeting.find({}).populate('user').populate('order').exec((error, result) => {
                    if (error) {
                        return res.status(400).json({ "success": false, "message": "Error Fetching Orders' Data" });
                    }
                    return res.status(200).json({ "success": true, "meetings": result });
                })
            })
        })
    },
    fetchServices: async (req, res) => {
        let token = req.headers['authorization'];
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) { return res.status(403).json({ "success": false, "message": "Invalid Bearer Token" }); }
            const client = decoded.user;
            User.findOne({ _id: client._id }, (e, user) => {
                if (e) { return res.status(400).json({ "success": false, "message": "Error Fetching User" }); }
                else if (!user) {
                    return res.status(403).json({ "success": false, "message": "User not found" });

                }
                else if (!user.is_admin) {
                    return res.status(403).json({ "success": false, "message": "Invalid access to admin feature" });
                }
                Service.find({}).populate('addedBy').exec((error, result) => {
                    if (error) {
                        return res.status(400).json({ "success": false, "message": "Error Fetching Orders' Data" });
                    }
                    return res.status(200).json({ "success": true, "services": result });
                })
            })
        })
    },

    addNewAdmin: async (req, res) => {
        let token = req.headers['authorization'];
        const { name, phone, country, city, address, password, passConfirmation } = req.body;

        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) { return res.status(403).json({ "success": false, "message": "Invalid Bearer Token" }); }
            const client = decoded.user;
            User.findOne({ _id: client._id }, (e, user) => {
                if (e) { return res.status(400).json({ "success": false, "message": "Error Fetching User" }); }
                else if (!user) {
                    return res.status(403).json({ "success": false, "message": "User not found" });
                }
                else if (!user.is_admin) {
                    return res.status(403).json({ "success": false, "message": "Invalid access to admin feature" });
                }

            })

            if (passConfirmation === password && password.length >= 8 && isPhoneNumber(phone)) {
                bcrypt.hash(password, 10, async (err, hash) => {
                    if (err) {
                        return res.status(400).json({ "success": false, "message": "Error Hashing password" })
                    }
                    const newAdmin = new User({
                        name: name,
                        phone: phone,
                        country: country,
                        city: city,
                        address: address,
                        password: hash,
                        user_type: 2,
                        is_admin: true,
                    });

                    await newAdmin.save()
                        .then((admin) => {
                            return res.status(201).json({ "success": true, "admin": admin });
                        })
                        .catch((error) => {
                            return res.status(400).json({ "success": false, "message": "Error, admin may already exist", "Err": error })
                        })

                })
            }

        })
    }

}
