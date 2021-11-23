const User = require("../models/user.model");
const Order = require("../models/order.model");
const Offer = require('../models/offer.model');
const Meeting = require("../models/meeting.model");
const Complaint = require("../models/complaint.model");
const Student = require("../models/student.model");
const Business = require("../models/business.model");
const Application = require("../models/application.model");
const Category = require("../models/category.model");
const WishListItem = require("../models/wishlist.item.model");
const Sub = require("../models/sub_category.model");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config({});
const secretKey = process.env.JWT_SECRET;

function deleteUserMeetings(id) {
    Meeting.deleteMany({ user: id })
        .then((res) => { console.log(res) })
        .catch((e) => { console.log(e) });
}

function deleteOrderComplaints(id) {
    Complaint.deleteMany({ order: id })
        .then((res) => { console.log(res) })
        .catch((err) => { console.log(err) });
}

function deleteUserComplaints(id) {
    Complaint.deleteMany({ complainant: id })
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
            if (client.user_type === 0) {
                Student.findOne({ userInfo: client._id })
                    .populate('userInfo')
                    .populate({ path: 'userInfo.complaints' })
                    .populate({ path: 'userInfo.meetings' })
                    .populate('orders')
                    .exec(function (error, result) {
                        if (error) { return res.status(400).json({ "success": false, "message": "User not found" }) }
                        return res.status(200).json({ "success": true, "profile": result });
                    });
            } else if (client.user_type === 1) {
                Business.findOne({ userInfo: client._id })
                    .populate('userInfo')
                    .populate({ path: 'userInfo.complaints' })
                    .populate({ path: 'userInfo.meetings' })
                    .populate('offers')
                    .exec(function (e, freelancer) {
                        if (e) { return res.status(400).json({ "success": false, "message": "User not found" }) }
                        return res.status(200).json({ "success": true, "profile": freelancer });
                    })

            }

        })
    },
    getOrdersList: async (req, res) => {
        let token = req.headers['authorization'];
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                return res.status(403).json({ "success": false, "message": "Unauthorized access, invalid access token" });
            }
            const client = decoded.user;
            WishListItem.find({ user: client._id }).populate({ path: 'service', select: 'name' })
                .then((customs) => {
                    Order.find({ user: client._id }).populate('offer', '-orders -service -__v -createdAt -updatedAt -complaints -addedBy -_id')
                        .then((orders) => {
                            return res.status(200).json({ "success": true, "result": { "orders_on_offers": orders, "custom_orders": customs } });
                        }).catch(() => {
                            return res.status(404).json({ "success": false, "message": "Unable to fetch orders!" });
                        })
                }).catch(() => {
                    return res.status(400).json({ "success": false, "message": "Error fetching Custom Orders" });
                });
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
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                return res.status(403).json({ "success": false, "message": "Unauthorized access, invalid access token" });
            }
            else if (decoded.user.user_type != 0) {
                return res.status(401).json({ "success": false, "message": "Only students are allowed to submit complaints about orders" })
            }


            const { details, order, order_type } = req.body;
            if (order_type != 0 && order_type != 1) {
                return res.status(400).json({ "success": false, "message": "Please specify a valid order type" });
            } else if (order_type === 0) {

                Order.findOne({ _id: order }, async (e, o) => {
                    if (e || !o) {
                        return res.status(400).json({ "success": false, "message": "Order not found" });
                    } else if (o.user != decoded.user._id) {
                        return res.status(400).json({ "success": false, "message": "This order doesn't belong to the this user" });
                    }
                    const newComplaint = new Complaint({
                        complainant: decoded.user._id,
                        details: details,
                        order: order
                    });
                    await newComplaint.save()
                        .then((complaint) => {
                            Student.findOneAndUpdate({ userInfo: decoded.user._id }, { $addToSet: { complaints: complaint } }).exec(function (e, result) {
                                if (e) return res.status(400).json({ "success": false, "message": "Unable to create new complaint" });
                                Order.findOneAndUpdate({ _id: order }, { $addToSet: { complaints: complaint } }).exec(function (e, result) {
                                    if (e) return res.status(400).json({ "success": false, "message": "Unable to append report to this order" });
                                    console.log("Complaint Successful");
                                })
                                return res.status(201).json({ "success": true, "result": complaint })
                            })

                        })
                        .catch((e) => { return res.status(400).json({ "success": false, "message": "Invalid fields, check values and try again", "err": e }) });
                });
            } else if (order_type === 1) {

                WishListItem.findOne({ _id: order }, async (e, wish) => {
                    if (e || !wish) {
                        return res.status(400).json({ "success": false, "message": "Custom order not found" });
                    } else if (o.user != decoded.user._id) {
                        return res.status(400).json({ "success": false, "message": "This custom order doesn't belong to the this user" });
                    }
                    const newComplaint = new Complaint({
                        complainant: decoded.user._id,
                        details: details,
                        order: order
                    });
                    await newComplaint.save()
                        .then((complaint) => {
                            Student.findOneAndUpdate({ userInfo: decoded.user._id }, { $addToSet: { complaints: complaint } }).exec(function (e, result) {
                                if (e) return res.status(400).json({ "success": false, "message": "Unable to create new complaint" });
                                wishlistItemM.findOneAndUpdate({ _id: order }, { $addToSet: { complaints: complaint } }).exec(function (e, result) {
                                    if (e) return res.status(400).json({ "success": false, "message": "Unable to append report to this order" });
                                    console.log("Complaint Successful");
                                })
                                return res.status(201).json({ "success": true, "result": complaint })
                            })

                        })
                        .catch((e) => { return res.status(400).json({ "success": false, "message": "Invalid fields, check values and try again", "err": e }) });
                });
            }
        });
    },
    getComplaints: async (req, res) => {
        let token = req.headers['authorization'];
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                return res.status(403).json({ "success": false, "message": "Unauthorized access, invalid access token" })
            }
            Complaint.find({ complainant: decoded.user._id }).select('-complainant -createdAt -updatedAt -__v').populate({ path: 'order', select: "details status deadline language confirmed" }).exec((e, complaints) => {
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
    },
    updateName: async (req, res) => {
        let token = req.headers['authorization'];
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                return res.status(403).json({ "success": false, "message": "Unauthorized access, invalid access token" });
            }
            const name = req.body.name;
            if (!name || name.length === 0 || !/^[a-zA-Z\s]*$/.test(name)) {
                return res.status(400).json({ "success": false, "message": "Please insert a valid name" })
            }
            User.findOneAndUpdate({ _id: decoded.user._id }, { name: name }, (error, user) => {
                if (error) {
                    return res.status(400).json({ "success": false, "message": "Error updating name" });
                }
                return res.status(200).json({ "success": true, "message": "User name updated successfully" });
            })
        })
    },
    newOrder: async (req, res) => {
        let t = req.headers['authorization'];
        jwt.verify(t, secretKey, async (err, decoded) => {
            if (err) { res.status(403).json({ "Success": false, "Message": "Invalid access token" }); }
            else if (decoded) {

                const { offer, language, details, deadline } = req.body;
                const newOrder = new Order({
                    offer: offer,
                    language: language,
                    deadline: deadline,
                    details: details,
                    user: decoded.user._id,
                })

                await newOrder.save()
                    .then((order) => {
                        Offer.findOneAndUpdate({ _id: offer }, { $addToSet: { orders: order } }).exec((error, offer) => {
                            if (error) {
                                return res.status(400).json({ "success": false, "message": "Can't add order on this offer" });
                            }
                            return res.status(201).json({ "success": true, "message": "Successful order upload", "result": "Succeded", "user": decoded.user, "order": order });

                        })

                    }).catch((e) => {
                        return res.status(400).json({ "success": false, "message": "Unsuccessful order upload", "result": "Failure", "user": decoded.user, "error": e });
                    });

            }

        })
    },
    updateAvatar: async (req, res) => {
        let token = req.headers['authorization'];
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) { return res.status(403).json({ "success": false, "message": "Unauthorized access, invalid token" }) }
            const client = decoded.user;
            const image = req.body.image;
            User.findOneAndUpdate({ _id: client._id }, { avatar: image }).exec((e, result) => {
                if (e) {
                    return res.status(400).json({ "success": false, "message": "Error Updating User Avatar", "Err": e });
                } else {
                    return res.status(200).json({ "success": true, "message": "Updated successfully" });
                }
            })
        })
    },
    submitJobRequest: (req, res) => {
        const token = req.headers['authorization'];
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err || !decoded) { return res.status(403).json({ "success": false, "message": "Unauthorized access, invalid token" }) }
            else if (decoded.user.user_type != 1) {
                return res.status(401).json({ "success": false, "message": "Only freelancers can submit job applications" });
            }
            const { resume, role, category, field, sample, price_range, availability } = req.body;
            Category.findOne({ name: category })
                .then((cat) => {
                    Sub.findOne({ name: field })
                        .then(async (sub) => {
                            const newApplication = new Application({
                                category: cat._id,
                                field: sub._id,
                                sample: sample,
                                role: role,
                                resume: resume,
                                freelancer: decoded.user._id,
                                price_range: price_range,
                                availability: availability,
                            });
                            await newApplication
                                .save()
                                .then(() => {
                                    return res.status(201).json({ "success": true, "message": "Application submitted" });
                                }).catch((e) => { return res.status(400).json({ "success": false, "message": "Make sure all fields are filled", "error": e }) })
                        }).catch(() => { return res.status(400).json({ "success": false, "message": "Sub-Category not found" }) })
                }).catch(() => { return res.status(400).json({ "success": false, "message": "Category not found" }) })
        })
    },

    deleteOrder: (req, res) => {
        let token = req.headers['authorization'];
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err || !decoded) { return res.status(403).json({ "success": false, "message": "Unauthorized access, invalid token" }) }
            else if (decoded.user.user_type != 0) {
                return res.status(401).json({ "succes": false, "message": "Only students can delete orders" });
            }
            const order = req.body.order;
            const type = req.body.type;
            Student.findOneAndUpdate({ userInfo: decoded.user._id }, { $pull: { orders: order } })
                .then(() => {
                    //ord is order object returned from this query
                    if (type != 0 && type != 1) {
                        return res.status(400).json({ "success": false, "message": "Invalid order type" });
                    } else if (type === 0) {
                        Order.findOneAndDelete({ _id: order }, (error, done) => {
                            if (error || !done) { return res.status(404).json({ "success": false, "message": "Unable to remove order, not found" }) }
                            deleteOrderComplaints(order);
                            return res.status(200).json({ "success": true, "message": "Order deleted successfully" });
                        });
                    } else if (type === 1) {
                        WishListItem.findOneAndDelete({ _id: order }, (e, deleted) => {
                            if (e || !deleted) { return res.status(404).json({ "success": false, "message": "Unable to remove custom order, not found" }) }
                            deleteOrderComplaints(order);
                            return res.status(200).json({ "success": true, "message": "Custom order deleted successfully" });
                        });
                    }


                })
                .catch(() => { return res.status(400).json({ "success": false, "message": "This order doesn't belong to this student" }) })
        })
    },

    createWishListItem: (req, res) => {
        let token = req.headers['authorization'];
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err || !decoded) { return res.status(403).json({ "success": false, "message": "Unauthorized access, invalid token" }) }
            else if (decoded.user.user_type != 0) {
                return res.status(401).json({ "success": false, "message": "Only students can create wishlist items" });
            }
            const { warranty, information, service, deadline, quality, language } = req.body;
            Sub.findOne({ name: service }, async (error, sub) => {
                if (error) { return res.status(400).json({ "success": false, "message": "Service not found" }) }
                const newWishListItem = new WishListItem({
                    language: language,
                    deadline: deadline,
                    warranty: warranty,
                    information: information,
                    service: sub._id,
                    quality: quality,
                    user: decoded.user._id,
                });
                await newWishListItem.save()
                    .then(() => { return res.status(201).json({ "success": true, "message": "Item created successfully" }) })
                    .catch(() => { return res.status(400).json({ "success": false, "message": "Please fill all fields" }) });
            })
        })
    }
}