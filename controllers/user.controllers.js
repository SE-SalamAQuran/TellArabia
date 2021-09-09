const User = require("../models/user.model");
const Order = require("../models/order.model");
Meeting = require("../models/meeting.model");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config({});
const secretKey = process.env.JWT_SECRET;


module.exports = {
    profile: async (req, res) => {
        let token = req.headers['authorization'];
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                return res.status(403).json({ "success": false, "message": "Unauthorized access, invalid access token" });
            }
            const client = decoded.user;
            User.findOne({ _id: client._id }).populate('orders').exec((e, u) => {
                if (e) return res.status(404).json({ "success": false, "message": "User not found in the DB!" });
                return res.status(200).json({ "success": true, "result": u });
            })
        })
    },
    getOrdersList: async (req, res) => {
        let token = req.headers['authorization'];
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                return res.status(403).json({ "success": false, "message": "Unauthorized access, invalid access token" });
            }
            const client = decoded.user;
            Order.find({ user: client._id }).exec((err, orders) => {
                if (err) return res.status(404).json({ "success": false, "message": "User not found in the DB!" });
                return res.status(200).json({ "success": true, "result": orders });
            })
        })
    },
    findUser: async (req, res) => {
        const phone = req.body.phone;
        User.findOne({ phone: phone }, (err, user) => {
            if (err || !user) { return res.status(404).json({ "found": false }); }
            else {
                return res.status(200).json({ "found": true });

            }
        });
    }

}