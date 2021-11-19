const User = require("../models/user.model");
const Order = require("../models/order.model");
const Meeting = require("../models/meeting.model");
const Complaint = require("../models/complaint.model");
const Service = require("../models/service.model");
const Student = require("../models/student.model");
const Business = require("../models/business.model");
const Sub = require("../models/sub_category.model");
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
                Order.find({}).populate({ path: 'user', select: 'name phone city country' }).populate({ path: 'offer', select: 'price title likes service -description -__v -createdAt -updatedAt' }).populate({ path: 'offer', populate: { path: 'service', select: 'name' } }).select('-__v -createdAt -updatedAt').exec((error, result) => {
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
                Complaint.find({}).select('-createdAt -updatedAt -__v').populate({ path: 'order', select: "details status deadline language confirmed" }).populate({ path: 'complainant', select: "-createdAt -updatedAt -__v -is_admin -is_active -meetings" }).exec((error, result) => {
                    if (error) {
                        return res.status(400).json({ "success": false, "message": "Error Fetching Complaints' Data", "Error": error });
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
                Sub.find({}).populate({ path: 'parentCategory', select: "name" }).select('-__v -createdAt -updatedAt').exec((error, result) => {
                    if (error) {
                        return res.status(400).json({ "success": false, "message": "Error Fetching Services' Data" });
                    }
                    return res.status(200).json({ "success": true, "services": result });
                })
            })
        })
    },


    newAdmin: async (req, res) => {
        let token = req.headers['authorization'];
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) { return res.status(403).json({ "success": false, "message": "Unauthorized, invalid access token" }) }
            User.findOne({ _id: decoded.user._id }, (e, user) => {
                if (e || !user) {
                    return res.status(404).json({ "success": false, "message": "User not found!" });
                }
                else if (!user.is_admin) {
                    return res.status(401).json({ "success": false, "message": "Invalid access credentials to admin feature" });
                }
                else {
                    const { name, phone, city, country, password, user_type } = req.body;
                    if (user_type != 2) {
                        return res.status(400).json({ "success": false, "message": "Invalid user type" });
                    }
                    if (password.length >= 8 && isPhoneNumber(phone)) {
                        bcrypt.hash(password, 10, async (error, hashed) => {
                            if (error) { return res.status(400).json({ "success": false, "message": "Unable to hash password" }) }
                            const newAdmin = new User({
                                name: name,
                                password: hashed,
                                city: city,
                                phone: phone,
                                country: country,
                                user_type: user_type,
                                is_admin: true,
                            });

                            await newAdmin.save()
                                .then((admin) => {
                                    return res.status(201).json({ "success": true, "admin": admin });
                                }).catch((insertError) => {
                                    return res.status(400).json({ "success": false, "message": "User already exists", "Error": insertError });
                                })
                        })
                    }
                }
            })
        });
    }

}
