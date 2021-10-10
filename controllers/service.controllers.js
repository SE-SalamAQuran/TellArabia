const User = require("../models/user.model");
const Service = require("../models/service.model");
const Category = require("../models/category.model");
const Sub = require("../models/sub_category.model");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config({});
const secretKey = process.env.JWT_SECRET;

module.exports = {
    addCategory: async (req, res) => {
        let token = req.headers['authorization'];
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) { return res.status(403).json({ "success": false, "message": "Invalid access token" }) }
            else {
                User.findOne({ _id: decoded.user._id }, async (error, user) => {
                    if (error) { return res.status(400).json({ "success": false, "message": "Unable to find user" }) }
                    else if (!user.is_admin) { return res.status(403).json({ "success": false, "message": "Unauthorized access to admin feature" }) }
                    const { name, url } = req.body;
                    const newCategory = new Category({
                        name: name,
                        url: url,
                        addedBy: user._id,
                    });
                    await newCategory.save()
                        .then((result) => {
                            const newService = new Service({
                                main_category: result._id,
                                sub_categories: [],
                            });
                            newService.save().then((service) => { return res.status(201).json({ "success": true, "message": "Service category added successfully", "result": service }) })
                                .catch((insertError) => { return res.status(400).json({ "success": false, "message": "Error adding service, already exists", "error": insertError }) });
                        }).catch((e) => { return res.status(400).json({ "success": false, "message": "Category already exists", "Error": e }) })
                })


            }
        })
    },

    getServicesByCategory: async (req, res) => {
        let token = req.headers['authorization'];
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) { return res.status(403).json({ "success": false, "message": "Invalid access token" }) }
            else {
                const category = req.query.category;
                if (!category) {
                    return res.status(404).json({ "success": false, "message": "Category is required" })
                }
                Category.findOne({ name: category }, (error, found) => {
                    if (error) {
                        return res.status(404).json({ "success": false, "message": "Category not recognized" })
                    } else {
                        Service.find({ main_category: found._id }).populate('main_category').populate('sub_categories').exec(function (e, result) {
                            if (e) { return res.status(400).json({ "success": false, "message": "Failed to obtain services" }) }
                            else if (!result || result === null) {
                                return res.status(404).json({ "success": false, "message": "Invalid category type" });
                            }
                            const services = result[0].sub_categories;

                            return res.status(200).json({ "success": true, "result": services });
                        })
                    }
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
                    const { main, sub } = req.body;
                    Category.findOne({ name: main }, (e, category) => {
                        if (e || !category) { return res.status(400).json({ "success": false, "message": "You need to insert this category first" }) }
                        else {
                            Service.findOne({ main_category: category._id }, async (error, service) => {
                                if (error) {
                                    return res.status(400).json({ "success": false, "message": "Unable to add new service" })
                                } else {
                                    const newSubCategory = new Sub({
                                        parentCategory: service.main_category,
                                        name: sub.name,
                                        price: sub.price,
                                        description: sub.description,
                                        addedBy: user._id,
                                    });
                                    await newSubCategory.save()
                                        .then((subCat) => {
                                            Service.findOneAndUpdate({ main_category: category._id }, { $addToSet: { sub_categories: subCat._id } }).exec(function (pushError, update) {
                                                if (pushError) {
                                                    return res.status(400).json({ "success": false, "message": "Error updating service", "error": pushError });
                                                }
                                                return res.status(202).json({ "success": true, "message": "Service added successfully" });
                                            })
                                        })
                                        .catch((insertError) => {
                                            return res.status(400).json({ "success": false, "message": "Error adding sub category, already exists", "error": insertError });
                                        })
                                }
                            })
                        }
                    })
                })
            }
        })
    },
    getAllServices: async (req, res) => {
        let token = req.headers['authorization'];
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) { return res.status(403).json({ "success": false, "message": "Invalid access token" }) }
            else {
                services = {}
                Service.find({}).populate('main_category').populate('sub_categories')
                    .then((result) => {
                        result.forEach((item) => {
                            services[item['main_category']['name']] = item['sub_categories']
                        })
                        return res.status(200).json({ "success": true, "result": services });

                    }).catch((error) => {
                        return res.status(400).json({ "success": false, "message": "Unable to find services" });

                    });
            }
        })
    },


}