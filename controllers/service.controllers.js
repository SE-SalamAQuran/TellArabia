const User = require("../models/user.model");
const Service = require("../models/service.model");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config({});
const secretKey = process.env.JWT_SECRET;

module.exports = {
    getServicesByCategory: async (req, res) => {
        let token = req.headers['authorization'];
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) { return res.status(403).json({ "success": false, "message": "Invalid access token" }) }
            else {
                const category = req.query.category;
                if (!category) {
                    return res.status(404).json({ "success": false, "message": "Category not recognized" })
                }
                Service.find({ main_category: category }, (e, result) => {
                    if (e) { return res.status(400).json({ "success": false, "message": "Failed to obtain services" }) }
                    else if (!result || result === null) {
                        return res.status(404).json({ "success": false, "message": "Invalid category type" });
                    }
                    return res.status(200).json({ "success": true, "result": result });
                })
            }
        })
    },
    addNewService: async (req, res) => {
        let token = req.headers['authorization'];
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) { return res.status(403).json({ "success": false, "message": "Invalid access token" }) }
            else {
                User.findOne({ _id: decoded.user._id }, async (error, user) => {
                    if (error) { return res.status(400).json({ "success": true, "message": "Failed to get user" }) }
                    else if (!user.is_admin) {
                        return res.status(403).json({ "success": false, "message": "Unauthorized access to admin feature" });
                    }
                    const { main_category, sub_category, price, description } = req.body;
                    const newService = new Service({
                        main_category: main_category,
                        sub_category: sub_category,
                        price: price,
                        description: description,
                        addedBy: user._id
                    })
                    await newService.save()
                        .then((result) => { return res.status(201).json({ "success": true, "message": "Service added successfully", "result": [result.main_category, result.sub_category] }) })
                        .catch((e) => { return res.status(400).json({ "success": false, "message": "Error adding service", "Error": e }) })
                })
            }
        })
    }
}