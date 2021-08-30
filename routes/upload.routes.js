const uploadRouter = require('express').Router();
const uploadMiddleware = require('../middleware/order.files.upload');
const dotenv = require('dotenv').config({});
const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET;

uploadRouter.route('/multiple').post(uploadMiddleware.array('files', 6), (req, res, next) => {
    token = req.headers['authorization'];
    jwt.verify(token, secretKey, function (err, decoded) {
        if (err) {
            return res.status(403).json({ "success": false, "message": "Unsuccessful upload of file(s), invalid token", "result": `0 uploaded!` });
        }
        return res.status(200).json({ "success": true, "message": "Successful upload of file(s)!", "result": `${req.files.length} uploaded!`, "user": decoded.user });

    });

    next();
});

module.exports = uploadRouter;