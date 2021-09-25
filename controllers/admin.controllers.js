const User = require("../models/user.model");
const Order = require("../models/order.model");
const Meeting = require("../models/meeting.model");
const Complaint = require("../models/complaint.model");
const Student = require("../models/student.model");
const Business = require("../models/business.model");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config({});
const secretKey = process.env.JWT_SECRET;

module.exports = {
    //Admin access all orders
    getAllOrders: async (req, res) => {
        let token = req.headers['authorization'];
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) { return res.status(403).json({ "success": false, "message": "Invalid Bearer Token" }); }
            const client = decoded.user;
            User.findOne({ _id: client._id }, (e, user) => {
                if (e) { return res.status(400).json({ "success": false, "message": "Error Fetching User" }); }
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
    }
}
