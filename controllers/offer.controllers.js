const Offer = require("../models/offer.model");
const User = require("../models/user.model");
const Service = require("../models/service.model");
const Category = require("../models/category.model");
const Business = require("../models/business.model");
const Sub = require("../models/sub_category.model");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config({});
const secretKey = process.env.JWT_SECRET;


module.exports = {
    newOffer: async (req, res) => {
        let token = req.headers['authorization'];
        jwt.verify(token, secretKey, (e, decoded) => {
            if (e) { return res.status(403).json({ "success": false, "message": "Invalid access token" }) }
            User.findOne({ _id: decoded.user._id }, (e, user) => {
                if (e || !user.is_admin) {
                    return res.status(401).json({ "success": false, "message": "Must be an admin to add an offer" })
                }
                const { price, images, service, description } = req.body;
                if (images.length === 0) {
                    return res.status(400).json({ "success": true, "message": "You must add links to images of your previous work" })
                }
                else if (service && price && images) {
                    Sub.findOne({ name: service }, async (err, result) => {
                        if (err || !result) { return res.status(404).json({ "success": false, "message": "Service doesn't exist" }) }
                        else {
                            Business.findOne({ userInfo: decoded.user._id })
                                .then(async (freelancer) => {
                                    const newOffer = new Offer({
                                        price: price,
                                        service: result._id,
                                        addedBy: freelancer._id,
                                        images: images,
                                        description: description,
                                    });
                                    await newOffer.save()
                                        .then((offer) => {
                                            Sub.findOneAndUpdate({ _id: result._id }, { $addToSet: { offers: offer } })
                                                .then((done) => {
                                                    Business.findOneAndUpdate({ userInfo: decoded.user._id }, { $addToSet: { offers: offer } })
                                                        .then((results) => {
                                                            return res.status(201).json({ "success": true, "message": "Successfully added offer" })
                                                        })
                                                        .catch((errors) => {
                                                            return res.status(400).json({ "success": false, "message": "Unable to add offer to this user" });
                                                        })
                                                })
                                                .catch((e) => {
                                                    return res.status(400).json({ "success": false, "message": "Unable to add offer on this service" });

                                                })
                                        }).catch((error) => { return res.status(400).json({ "success": false, "message": "Error adding offer", "error": error }) })
                                })
                                .catch((notFound) => {
                                    return res.status(400).json({ "success": false, "message": "User not found" })
                                })

                        }
                    })

                }

                else {
                    return res.status(400).json({ "success": false, "message": "Some fields are missing" })
                }

            })
        })
    },
    getAllOffers: async (req, res) => {
        let token = req.headers['authorization'];
        jwt.verify(token, secretKey, (error, decoded) => {
            if (error) { return res.status(403).json({ "success": false, "message": "Invalid access token" }) }
            Offer.find({})
                .populate({ path: "service", 'select': 'name' })
                .populate("addedBy")
                .populate({
                    path: 'addedBy',
                    populate: {
                        path: 'userInfo'
                    }
                })
                .exec(function (err, offers) {
                    if (err) { return res.status(404).json({ "success": false, "message": "No offers found!" }) }

                    return res.status(200).json({ "success": true, "result": offers });
                })

        })
    },
    getOffersByService: async (req, res) => {
        let token = req.headers['authorization'];
        jwt.verify(token, secretKey, (error, decoded) => {
            if (error) { return res.status(403).json({ "success": false, "message": "Invalid access token" }) }
            const service = req.query.service;
            Sub.findOne({ name: service }, (err, result) => {
                if (err || !result) {
                    return res.status(404).json({ "success": false, "message": "Service not found" });
                }
                Offer.find({ service: result._id })
                    .populate({ path: "service", 'select': 'name' })
                    .populate("addedBy")
                    .populate({
                        path: 'addedBy',
                        populate: {
                            path: 'userInfo'
                        }
                    })
                    .exec(function (err, offers) {
                        if (err) { return res.status(404).json({ "success": false, "message": "No offers found on this service" }) }

                        return res.status(200).json({ "success": true, "result": offers });
                    })
            })

        })
    },
    getOfferData: async (req, res) => {
        let token = req.headers['authorization'];
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) { return res.status(403).json({ "success": false, "message": "Invalid access token" }) }
            const offerID = req.query.id;
            Offer.findOne({ _id: offerID })
                .populate({ path: "service", 'select': 'name' })
                .populate("addedBy")
                .populate({
                    path: 'addedBy',
                    populate: {
                        path: 'userInfo'
                    }
                })
                .exec((error, offer) => {
                    if (error) { return res.status(404).json({ "success": false, "message": "Can't find the offer specified" }) }
                    return res.status(200).json({ "success": true, "offer": offer });
                })
        })
    },
    getUserOffers: async (req, res) => {
        let token = req.headers['authorization'];
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err || !decoded) { return res.status(403).json({ "success": false, "message": "Invalid access token" }) }
            else if (decoded.user.user_type != 1) {
                return res.status(401).json({ "success": false, "message": "Must be a freelancer to view your offers" });
            }
            Business.findOne({ userInfo: decoded.user._id }, (e, result) => {
                if (e) { return res.status(404).json({ "success": false, "message": "User not found" }) }
                Offer.find({ 'addedBy': result._id })
                    .populate({ path: "service", 'select': 'name' })
                    .populate("addedBy")
                    .populate({
                        path: 'addedBy',
                        populate: {
                            path: 'userInfo'
                        }
                    })
                    .populate("orders")
                    .exec(function (error, offers) {
                        if (error) { return res.status(404).json({ "success": false, "message": "No offers found on this service" }) }

                        return res.status(200).json({ "success": true, "offers": offers });
                    })

            })

        })
    },
    likeOffer: async (req, res) => {
        let token = req.headers['authorization'];
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err || !decoded) { return res.status(403).json({ "success": false, "message": "Invalid access token" }) }
            else if (decoded.user.user_type != 0) {
                return res.status(401).json({ "success": false, "message": "Non-student users can't like offers" });
            }
            const offerId = req.body.offer;
            Offer.findOneAndUpdate({ _id: offerId }, { $inc: { likes: 1 } }).then((result) => {
                return res.status(200).json({ "success": true, "message": "Like added successfully" });
            }).catch((e) => {
                return res.status(400).json({ "success": false, "message": "Unable to like this offer" });
            })
        })
    }
}