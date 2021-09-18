const User = require("../models/user.model");
const Order = require("../models/order.model");
const Meeting = require("../models/meeting.model");
const Complaint = require("../models/complaint.model");
const Student = require("../models/student.model");
const Business = require("../models/business.model");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config({});
const secretKey = process.env.JWT_SECRET;

function deleteUserMeetings(id) {
    Meeting.deleteMany({ user: id })
        .then((res) => { console.log(res) })
        .catch((e) => { console.log(e) });
}

function deleteUserComplaints(id) {
    Complaint.deleteMany({ user: id })
        .then((res) => { console.log(res) })
        .catch((err) => { console.log(err) });
}

function deleteUserOrders(id) {
    Order.deleteMany({ user: id })
        .then((res) => { console.log(res) })
        .catch((err) => { console.log(err) });
}


module.exports = {
    profile: async (req, res) => {
        let token = req.headers['authorization'];
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                return res.status(403).json({ "success": false, "message": "Unauthorized access, invalid access token" });
            }
            const client = decoded.user;
            User.findOne({ _id: client._id }).populate('orders').populate('meetings').populate('complaints').exec((e, u) => {
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
            if (err || !user) { return res.status(200).json({ "found": false }); }
            else {
                return res.status(400).json({ "found": true });

            }
        });
    },
    addComplaint: async (req, res) => {
        let token = req.headers['authorization'];
        const { date, details, order } = req.body;
        jwt.verify(token, secretKey, async (err, decoded) => {
            if (err) {
                return res.status(403).json({ "success": false, "message": "Unauthorized access, invalid access token" });
            }
            const newComplaint = new Complaint({
                user: decoded.user._id,
                date: date,
                details: details,
                order: order,
            });
            await newComplaint.save()
                .then((complaint) => {
                    User.findOneAndUpdate({ _id: decoded.user._id }, { $push: { complaints: complaint } }).exec(function (e, result) {
                        if (e) return res.status(400).json({ "success": false, "message": "Unable to create new complaint" });
                        return res.status(201).json({ "success": true, "result": complaint })
                    })
                })
                .catch((e) => { return res.status(400).json({ "success": false, "message": "Invalid fields, check values and try again", "err": e }) });
        })

    },
    getComplaints: async (req, res) => {
        let token = req.headers['authorization'];
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                return res.status(403).json({ "success": false, "message": "Unauthorized access, invalid access token" })
            }
            Complaint.find({ user: decoded.user._id }).exec((e, complaints) => {
                if (e) return res.status(404).json({ "success": false, "message": "User not found in the DB!" });
                return res.status(200).json({ "success": true, "result": complaints });
            })
        })
    },

    deleteUser: async (req, res) => {
        let token = req.headers['authorization'];
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err || !decoded) {
                return res.status(403).json({ "success": false, "message": "Unauthorized access, invalid access token" });
            }
            let client = decoded.user;
            if (client.user_type === 0) {
                User.deleteOne({ _id: client._id }).then(() => {
                    Student.deleteOne({ userInfo: client._id })
                        .then(() => {
                            deleteUserOrders(client._id);
                            deleteUserMeetings(client._id);
                            deleteUserComplaints(client._id);
                            return res.status(200).json({ "success": true, "message": "Successful user deletion" });
                        })
                        .catch(() => {
                            return res.status(400).json({ "success": false, "message": "Failed to delete student" });
                        })
                }).catch((e) => {
                    return res.status(400).json({ "success": false, "message": "Unable to delete user" });
                })
            } else if (client.user_type === 1) {
                User.deleteOne({ _id: client._id }).then(() => {
                    Business.deleteOne({ userInfo: client._id })
                        .then(() => {
                            deleteUserOrders(client._id);
                            deleteUserMeetings(client._id);
                            deleteUserComplaints(client._id);
                            return res.status(200).json({ "success": true, "message": "Successful user deletion" });
                        })
                        .catch(() => {
                            return res.status(400).json({ "success": false, "message": "Failed to delete business" });
                        })
                }).catch((e) => {
                    return res.status(400).json({ "success": false, "message": "Unable to delete user" });
                })
            }
        })
    }

}