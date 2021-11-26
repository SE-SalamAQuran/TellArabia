const Offer = require("../models/offer.model");
const User = require("../models/user.model");
const Service = require("../models/service.model");
const Category = require("../models/category.model");
const Business = require("../models/business.model");
const Sub = require("../models/sub_category.model");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config({});
const secretKey = process.env.JWT_SECRET;
const multer = require("multer");
const { Storage } = require('@google-cloud/storage');


const storage = new Storage({
    projectId: process.env.GCLOUD_PROJECT_ID,
    keyFilename: process.env.GCLOUD_APPLICATION_CREDENTIALS,
});
const uploader = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // keep images size < 10 MB
    },
});


const bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET_URL);


module.exports = {
    newOffer: async (req, res) => {
        uploader.array("images", 6);
        let token = req.headers['authorization'];
        jwt.verify(token, secretKey, (e, decoded) => {
            if (e) { return res.status(403).json({ "success": false, "message": "Invalid access token" }) }
            User.findOne({ _id: decoded.user._id }, (e, user) => {
                if (e || !user.is_admin) {
                    return res.status(401).json({ "success": false, "message": "Must be an admin to add an offer" })
                }
                const { price, service, description } = req.body;
                if (!req.files) {
                    return res.status(400).json({ "success": false, "message": "You must add images" });
                }
                const images = req.files.images;

                if (images.length === 0) {
                    return res.status(400).json({ "success": true, "message": "You must add images" })
                }
                else if (service && price && images) {
                    Sub.findOne({ name: service }, async (err, result) => {
                        if (err || !result) { return res.status(404).json({ "success": false, "message": "Service doesn't exist" }) }
                        else {
                            var urls = [];
                            // Create new blob in the bucket referencing the file
                            images.forEach((file) => {
                                const blob = bucket.file(file.name);

                                // Create writable stream and specifying file mimetype
                                const blobWriter = blob.createWriteStream({
                                    metadata: {
                                        contentType: file.mimetype,
                                    },
                                });

                                blobWriter.on('error', (err) => {
                                    console.log("ERROR", err)
                                    return res.status(400).json({ "success": false, "message": "File invalid, corrupted or greater than 10MB" });

                                });
                                blobWriter.on('finish', async () => {
                                    urls.push(`https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURI(blob.name)}?alt=media`);
                                });
                                blobWriter.emit("finish", urls);
                                blobWriter.end(file.data);
                            })

                            const newOffer = new Offer({
                                price: price,
                                service: result._id,
                                addedBy: decoded.user._id,
                                images: urls,
                                description: description,
                            });
                            await newOffer.save()
                                .then((offer) => {
                                    Sub.findOneAndUpdate({ _id: result._id }, { $addToSet: { offers: offer } })
                                        .then((done) => {
                                            return res.status(201).json({ "success": true, "message": "Offer added successfully" });
                                        })
                                        .catch((e) => {
                                            return res.status(400).json({ "success": false, "message": "Unable to add offer on this service" });

                                        })
                                }).catch((error) => { return res.status(400).json({ "success": false, "message": "Error adding offer", "error": error }) })
                        }
                    });
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
            if (error || !decoded) { return res.status(403).json({ "success": false, "message": "Invalid access token" }) }
            User.findOne({ _id: decoded.user._id }, (e, user) => {
                if (e || !user.is_admin) {
                    return res.status(401).json({ "success": false, "message": "Must be an admin to add an offer" })
                }
                Offer.find({})
                    .populate({ path: "service", select: 'name' })
                    .select("-addedBy -__v -updatedAt -createdAt")
                    .exec(function (err, offers) {
                        if (err) { return res.status(404).json({ "success": false, "message": "No offers found!" }) }

                        return res.status(200).json({ "success": true, "result": offers });
                    })
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