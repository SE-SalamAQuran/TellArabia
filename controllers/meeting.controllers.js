const User = require("../models/user.model");
const Order = require("../models/order.model");
const Meeting = require("../models/meeting.model");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config({});
const secretKey = process.env.JWT_SECRET;

module.exports = {
    addMeeting: (req, res) => {
        let token = req.headers['authorization'];
        jwt.verify(token, secretKey, async (err, decoded) => {
            if (err) return res.status(403).json({ "success": false, "message": "Unauthorized access, invalid bearer token" });
            const { link, order, date, time } = req.body;
            const newMeeting = new Meeting({
                link: link,
                order: order,
                date: date,
                time: time,
                user: decoded.user._id,
            });
            await newMeeting.save()
                .then((meeting) => {
                    User.findOneAndUpdate({ _id: decoded.user._id }, { $push: { meetings: meeting } }).exec(function (e, result) {
                        if (e) return res.status(400).json({ "success": false, "message": "Unable to create new meeting" });
                        console.log(result);
                    })
                    return res.status(201).json({ "success": true, "result": meeting })
                        .catch((error) => {
                            return res.status(400).json({ "success": false, "message": "Unsuccessful meeting creation", "result": "Failure", "user": decoded.user, "error": error });

                        })
                })
        })
    },
    getMeetings: async (req, res) => {
        let token = req.headers['authorization'];
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) return res.status(403).json({ "success": false, "message": "Unauthorized access, invalid bearer token" });
            Meeting.find({ user: decoded.user._id }, (error, result) => {
                if (error) return res.status(404).json({ "success": false, "message": "Unable to find this user" });
                return res.status(200).json({ "success": true, "result": result });
            })
        })
    }
}
