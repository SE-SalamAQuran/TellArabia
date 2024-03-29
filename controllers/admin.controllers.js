const User = require("../models/user.model");
const Order = require("../models/order.model");
const Meeting = require("../models/meeting.model");
const Complaint = require("../models/complaint.model");
const Service = require("../models/service.model");
const Student = require("../models/student.model");
const Business = require("../models/business.model");
const Sub = require("../models/sub_category.model");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config({});
const secretKey = process.env.JWT_SECRET;
const bcrypt = require('bcryptjs');
const Application = require("../models/application.model");
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


function isPhoneNumber(inputtxt) {
    var phoneno = /^\+?([0-9]{3})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{5})$/;
    var result = false;
    if ((inputtxt.match(phoneno))) {
        result = true;
    }

    return result;
}

module.exports = {
    //Admin access all orders
    fetchOrders: async (req, res) => {
        let token = req.headers['authorization'];
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) { return res.status(403).json({ "success": false, "message": "Invalid Bearer Token" }); }
            const client = decoded.user;
            User.findOne({ _id: client._id }, (e, user) => {
                if (e) { return res.status(400).json({ "success": false, "message": "Error Fetching User" }); }
                else if (!user) {
                    return res.status(403).json({ "success": false, "message": "User not found" });

                }
                else if (!user.is_admin) {
                    return res.status(403).json({ "success": false, "message": "Invalid access to admin feature" });
                }
                Order.find({}).populate({ path: 'user', select: 'name phone city country' }).populate({ path: 'offer', select: 'price title likes service -description -__v -createdAt -updatedAt' }).populate({ path: 'offer', populate: { path: 'service', select: 'name' } }).select('-__v -createdAt -updatedAt').exec((error, result) => {
                    if (error) {
                        return res.status(400).json({ "success": false, "message": "Error Fetching Orders' Data" });
                    }
                    return res.status(200).json({ "success": true, "orders": result });
                })
            })
        })
    },

    fetchComplaints: async (req, res) => {
        let token = req.headers['authorization'];
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) { return res.status(403).json({ "success": false, "message": "Invalid Bearer Token" }); }
            const client = decoded.user;
            User.findOne({ _id: client._id }, (e, user) => {
                if (e) { return res.status(400).json({ "success": false, "message": "Error Fetching User" }); }
                else if (!user) {
                    return res.status(403).json({ "success": false, "message": "User not found" });
                }
                else if (!user.is_admin) {
                    return res.status(403).json({ "success": false, "message": "Invalid access to admin feature" });
                }
                Complaint.find({}).select('-createdAt -updatedAt -__v').populate({ path: 'order', select: "details status deadline language confirmed" }).populate({ path: 'complainant', select: "-createdAt -updatedAt -__v -is_admin -is_active -meetings" }).exec((error, result) => {
                    if (error) {
                        return res.status(400).json({ "success": false, "message": "Error Fetching Complaints' Data", "Error": error });
                    }
                    return res.status(200).json({ "success": true, "complaints": result });
                })
            })
        })
    },

    fetchMeetings: async (req, res) => {
        let token = req.headers['authorization'];
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) { return res.status(403).json({ "success": false, "message": "Invalid Bearer Token" }); }
            const client = decoded.user;
            User.findOne({ _id: client._id }, (e, user) => {
                if (e) { return res.status(400).json({ "success": false, "message": "Error Fetching User" }); }
                else if (!user) {
                    return res.status(403).json({ "success": false, "message": "User not found" });

                }
                else if (!user.is_admin) {
                    return res.status(403).json({ "success": false, "message": "Invalid access to admin feature" });
                }
                Meeting.find({}).populate('user').populate('order').exec((error, result) => {
                    if (error) {
                        return res.status(400).json({ "success": false, "message": "Error Fetching Orders' Data" });
                    }
                    return res.status(200).json({ "success": true, "meetings": result });
                })
            })
        })
    },
    fetchServices: async (req, res) => {
        let token = req.headers['authorization'];
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) { return res.status(403).json({ "success": false, "message": "Invalid Bearer Token" }); }
            const client = decoded.user;
            User.findOne({ _id: client._id }, (e, user) => {
                if (e) { return res.status(400).json({ "success": false, "message": "Error Fetching User" }); }
                else if (!user) {
                    return res.status(403).json({ "success": false, "message": "User not found" });

                }
                else if (!user.is_admin) {
                    return res.status(403).json({ "success": false, "message": "Invalid access to admin feature" });
                }
                Sub.find({}).populate({ path: 'parentCategory', select: "name" }).select('-__v -createdAt -updatedAt').exec((error, result) => {
                    if (error) {
                        return res.status(400).json({ "success": false, "message": "Error Fetching Services' Data" });
                    }
                    return res.status(200).json({ "success": true, "services": result });
                })
            })
        })
    },


    newAdmin: async (req, res) => {
        let token = req.headers['authorization'];
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) { return res.status(403).json({ "success": false, "message": "Unauthorized, invalid access token" }) }
            User.findOne({ _id: decoded.user._id }, (e, user) => {
                if (e || !user) {
                    return res.status(404).json({ "success": false, "message": "User not found!" });
                }
                else if (!user.is_admin) {
                    return res.status(401).json({ "success": false, "message": "Invalid access credentials to admin feature" });
                }
                else {
                    const { name, phone, city, country, password, user_type } = req.body;
                    if (user_type != 2) {
                        return res.status(400).json({ "success": false, "message": "Invalid user type" });
                    }
                    if (password.length >= 8 && isPhoneNumber(phone)) {
                        bcrypt.hash(password, 10, async (error, hashed) => {
                            if (error) { return res.status(400).json({ "success": false, "message": "Unable to hash password" }) }
                            const newAdmin = new User({
                                name: name,
                                password: hashed,
                                city: city,
                                phone: phone,
                                country: country,
                                user_type: user_type,
                                is_admin: true,
                            });

                            await newAdmin.save()
                                .then((admin) => {
                                    return res.status(201).json({ "success": true, "admin": admin });
                                }).catch((insertError) => {
                                    return res.status(400).json({ "success": false, "message": "User already exists", "Error": insertError });
                                })
                        })
                    }
                }
            })
        });
    },
    fetchJobApplications: (req, res) => {
        let token = req.headers['authorization'];
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) { return res.status(403).json({ "success": false, "message": "Invalid Bearer Token" }); }
            const client = decoded.user;
            User.findOne({ _id: client._id }, (e, user) => {
                if (e) { return res.status(400).json({ "success": false, "message": "Error Fetching User" }); }
                else if (!user) {
                    return res.status(403).json({ "success": false, "message": "User not found" });

                }
                else if (!user.is_admin) {
                    return res.status(403).json({ "success": false, "message": "Invalid access to admin feature" });
                }
                Application.find({}).populate({ path: 'freelancer', select: "name phone address city country" }).populate({ path: "category", select: "name" }).populate({ path: "field", select: "name" }).select('-__v -createdAt -updatedAt').exec((error, result) => {
                    if (error) {
                        return res.status(400).json({ "success": false, "message": "Error Fetching Job Applications" });
                    }
                    return res.status(200).json({ "success": true, "applications": result });
                })
            })
        })
    },

    updatePicture: (req, res) => {
        let token = req.headers['authorization'];
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) { return res.status(403).json({ "success": false, "message": "Invalid Bearer Token" }); }
            const client = decoded.user;
            User.findOne({ _id: client._id }, (e, user) => {
                if (e) { return res.status(400).json({ "success": false, "message": "Error Fetching User" }); }
                else if (!user) {
                    return res.status(403).json({ "success": false, "message": "User not found" });
                }
                else if (!user.is_admin) {
                    return res.status(403).json({ "success": false, "message": "Invalid access to admin feature" });
                }
                if (!req.files) {
                    return res.status(400).json({ "success": false, "message": "Image is required" });
                }
                const avatar = req.files.avatar;
                if (!avatar) {
                    console.log('Error, could not upload file');
                    return res.status(400).json({ "success": false, "message": "File is required" });
                }


                // Create new blob in the bucket referencing the file
                const blob = bucket.file(avatar.name);

                // Create writable stream and specifying file mimetype
                const blobWriter = blob.createWriteStream({
                    metadata: {
                        contentType: avatar.mimetype,
                    },
                });

                blobWriter.on('error', (err) => {
                    console.log("ERROR", err)
                    return res.status(400).json({ "success": false, "message": "File invalid, corrupted or greater than 10MB" });

                });

                blobWriter.on('finish', async () => {
                    const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURI(blob.name)}?alt=media`;
                    User.findOneAndUpdate({ _id: client._id }, { avatar: downloadUrl })
                        .then((result) => {
                            return res.status(200).json({ "success": true, "message": "User picture updated successfully" });
                        })
                        .catch((err) => {
                            return res.status(400).json({ "success": false, "message": "Error updating user picture", "Error": err });
                        });
                });
                blobWriter.end(avatar.data);
            });
        });
    },

    getAllFreelancers: (req, res) => {
        let token = req.headers['authorization'];
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) { return res.status(403).json({ "success": false, "message": "Invalid Bearer Token" }); }
            const client = decoded.user;
            User.findOne({ _id: client._id }, (e, user) => {
                if (e) { return res.status(400).json({ "success": false, "message": "Error Fetching User" }); }
                else if (!user) {
                    return res.status(403).json({ "success": false, "message": "User not found" });

                }
                else if (!user.is_admin) {
                    return res.status(403).json({ "success": false, "message": "Invalid access to admin feature" });
                }
                Business.find({}).populate({ path: 'userInfo' }).select('-__v -createdAt -updatedAt').exec((error, result) => {
                    if (error) {
                        return res.status(400).json({ "success": false, "message": "Error Fetching Freelancers" });
                    }
                    return res.status(200).json({ "success": true, "freelancers": result });
                })
            })
        })
    },
    changeOrderStatus: (req, res) => {
        let token = req.headers['authorization'];
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) { return res.status(403).json({ "success": false, "message": "Invalid Bearer Token" }); }
            const client = decoded.user;
            User.findOne({ _id: client._id }, (e, user) => {
                if (e) { return res.status(400).json({ "success": false, "message": "Error Fetching User" }); }
                else if (!user) {
                    return res.status(403).json({ "success": false, "message": "User not found" });

                }
                else if (!user.is_admin) {
                    return res.status(403).json({ "success": false, "message": "Invalid access to admin feature" });
                }
                const orderId = req.body.order;
                const status = req.body.status;
                if (!orderId || !status) {

                    return res.status(400).json({ "success": false, "message": "Some fields are missing" });
                }
                Order.findOneAndUpdate({ _id: orderId }, { status: status }, (e, done) => {
                    if (e || !done) { return res.status(400).json({ "success": false, "message": "Unable to update order status" }) }
                    return res.status(200).json({ "success": true, "message": `Order status updated successfully to ${status}` });
                });
            });
        })
    },

    changeComplaintStatus: (req, res) => {
        let token = req.headers['authorization'];
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) { return res.status(403).json({ "success": false, "message": "Invalid Bearer Token" }); }
            const client = decoded.user;
            User.findOne({ _id: client._id }, (e, user) => {
                if (e) { return res.status(400).json({ "success": false, "message": "Error Fetching User" }); }
                else if (!user) {
                    return res.status(403).json({ "success": false, "message": "User not found" });

                }
                else if (!user.is_admin) {
                    return res.status(403).json({ "success": false, "message": "Invalid access to admin feature" });
                }
                const complaintId = req.body.complaint;
                const status = req.body.status;
                if (!complaintId || !status) {
                    return res.status(400).json({ "success": false, "message": "Some fields are missing" });
                }
                Complaint.findOneAndUpdate({ _id: complaintId }, { status: status }, (e, done) => {
                    if (e) { return res.status(400).json({ "success": false, "message": "Unable to update complaint status" }) }
                    return res.status(200).json({ "success": true, "message": `Complaint status updated successfully to ${status}` });
                });
            });
        })
    },

    getStudents: (req, res) => {
        let token = req.headers['authorization'];
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) { return res.status(403).json({ "success": false, "message": "Invalid Bearer Token" }); }
            const client = decoded.user;
            User.findOne({ _id: client._id }, (e, user) => {
                if (e) { return res.status(400).json({ "success": false, "message": "Error Fetching User" }); }
                else if (!user) {
                    return res.status(403).json({ "success": false, "message": "User not found" });

                }
                else if (!user.is_admin) {
                    return res.status(403).json({ "success": false, "message": "Invalid access to admin feature" });
                }
                Student.find({}, (error, result) => {
                    if (error) {
                        return res.status(400).json({ "success": false, "message": "Unable to fetch students" });
                    }
                    return res.status(200).json({ "success": true, "students": result });
                }).select("-__v -updatedAt -createdAt -orders").populate({ path: "complaints", select: "-__v -updatedAt -createdAt" }).populate({ path: "userInfo", select: "-__v -updatedAt -createdAt" });
            });
        })
    },
    addPointsToStudent: (req, res) => {
        let token = req.headers['authorization'];
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) { return res.status(403).json({ "success": false, "message": "Invalid Bearer Token" }); }
            const client = decoded.user;
            User.findOne({ _id: client._id }, (e, user) => {
                if (e) { return res.status(400).json({ "success": false, "message": "Error Fetching User" }); }
                else if (!user) {
                    return res.status(403).json({ "success": false, "message": "User not found" });

                }
                else if (!user.is_admin) {
                    return res.status(403).json({ "success": false, "message": "Invalid access to admin feature" });
                }
                const student = req.body.studentID;
                //pts: points that admin wishes to add to the student
                const pts = req.body.points;

                if (!student || !pts) {
                    return res.status(400).json({ "success": false, "message": "Student ID and points must be provided" });
                }
                Student.findOne({ _id: student }, (e, result) => {
                    if (e) {
                        console.log("Student Not Found");
                    }
                    else if (pts < 0 && result['points'] === 0) {
                        return res.status(400).json({ "success": false, "message": "A student cannot have negative points" });
                    }
                    else {
                        Student.findOneAndUpdate({ _id: student }, { $inc: { points: pts } }, (error, result) => {
                            if (error) {
                                return res.status(400).json({ "success": false, "message": "Unable to update points" });
                            }
                            return res.status(200).json({ "success": true, "message": "Student Points updated" });
                        });
                    }
                })



            });
        })
    }
}
