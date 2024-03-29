const User = require("../models/user.model");
const Student = require("../models/student.model");
const Business = require("../models/business.model");

const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const randToken = require("rand-token");
const dotenv = require("dotenv").config({});
const secretKey = process.env.JWT_SECRET;
var refreshTokens = {};

function isTokenExpired(token) {
    const payloadBase64 = token.split('.')[1];
    const decodedJson = Buffer.from(payloadBase64, 'base64').toString();
    const decoded = JSON.parse(decodedJson)
    const exp = decoded.exp;
    return Date.now() >= exp * 1000;
}


function isPhoneNumber(inputtxt) {
    var phoneno = /^\+?(\d{3})\)?[-. ]?(\d{4})[-. ]?(\d{5})$/;
    var result = false;
    if ((inputtxt.match(phoneno))) {
        result = true;
    }

    return result;
}

function isTelephone(inputtxt) {
    var phoneno = /^\+?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{5})$/;
    var result = false;
    if ((inputtxt.match(phoneno))) {
        result = true;
    }
    return result;
}

module.exports = {
    registerUser: async (req, res) => {
        const { name, phone, city, country, address, password, passConfirmation, user_type } = req.body;
        if (password === passConfirmation && password.length >= 8 && isPhoneNumber(phone)) {
            bcrypt.hash(password, 10, async (err, hash) => {
                if (err) {
                    res.status(400).send(err);
                } else if (user_type === 0) {
                    const user = new User({
                        phone: phone,
                        name: name,
                        password: hash,
                        city: city,
                        address: address,
                        country: country,
                        user_type: user_type,
                    })
                    const { university, major, degree, language } = req.body;

                    await user.save()
                        .then((user) => {
                            const student = new Student({
                                university: university,
                                major: major,
                                degree: degree,
                                language: language,
                                country: country,
                                userInfo: user._id,
                            })
                            student.save().then(() => {

                                let jwtData = {
                                    _id: user["_id"],
                                    phone: user["phone"],
                                    user_type: user["user_type"],
                                    name: user["name"],
                                    city: user["city"],
                                    country: user["country"],
                                    address: user["address"],
                                    zipCode: user["zipCode"],
                                };
                                var token = jwt.sign({
                                    user: jwtData
                                }, secretKey, { expiresIn: '14d' });
                                var refreshToken = randToken.uid(256);
                                refreshTokens[refreshToken] = user["phone"];
                                let decoded = jwt.verify(token, secretKey);
                                const client = decoded.user;
                                res.status(200).json({
                                    token: token,
                                    refresh: refreshToken,
                                    currentUser: client
                                });
                            }).catch((err) => { return res.status(400).json({ "Status": "failed", "Message": "Student already exists" }) });
                        })
                        .catch((error) => { res.status(400).json({ "Status": "Error", "Message": "User already exists" }) });

                } else if (user_type === 1) {
                    const user = new User({
                        phone: phone,
                        name: name,
                        password: hash,
                        city: city,
                        address: address,
                        country: country,
                        user_type: user_type,
                    })
                    const { language, socialMediaURLs } = req.body;


                    await user.save()
                        .then((user) => {
                            const business = new Business({
                                name: name,
                                language: language,
                                socialMediaURLs: socialMediaURLs,
                                userInfo: user._id,
                            })
                            business.save().then(() => {
                                let jwtData = {
                                    _id: user["_id"],
                                    phone: user["phone"],
                                    user_type: user["user_type"],
                                    name: user["name"],
                                    city: user["city"],
                                    country: user["country"],
                                    address: user["address"],
                                    zipCode: user["zipCode"],
                                };
                                var token = jwt.sign({
                                    user: jwtData
                                }, secretKey, { expiresIn: '14d' });
                                var refreshToken = randToken.uid(256);
                                refreshTokens[refreshToken] = user["phone"];
                                let decoded = jwt.verify(token, secretKey);
                                const client = decoded.user;
                                res.status(200).json({
                                    token: token,
                                    refresh: refreshToken,
                                    currentUser: client
                                });
                            }).catch((error) => { return res.status(400).json({ "success": false, "message": "Business already exists" }) });

                        })
                        .catch((err) => { res.status(400).json({ "success": false, "message": "User already exists", "ERR": err }) });
                } else {
                    res.status(400).json({ "success": false, "message": "Invalid user type" });
                }
            })

        } else if (password.length < 8) {
            return res.status(400).json({ "success": false, "message": "password length can't be less than 8" });
        } else if (!isPhoneNumber(phone)) {
            return res.status(400).json({ "success": false, "message": "phone number is invalid" });
        }
        else {
            res.status(400).json({ "success": false, "message": "Passwords don't match" });
        }

    },
    login: async (req, res) => {
        const { phone, password } = req.body;
        User.findOne({ phone: phone }, (err, user) => {
            if (err) res.status(404).json({ "success": false, "message": "User not found" });
            else if (user) {
                bcrypt.compare(password, user.password, function (error, passMatch) {
                    if (error || !passMatch) { return res.status(401).json({ "success": false, "message": "Password is incorrect" }); }
                    else {
                        let jwtData = {
                            _id: user["_id"],
                            phone: user["phone"],
                            user_type: user["user_type"],
                            name: user["name"],
                            city: user["city"],
                            country: user["country"],
                            address: user["address"],
                            zipCode: user["zipCode"],
                        };
                        var token = jwt.sign({
                            user: jwtData
                        }, secretKey, { expiresIn: '14d' });
                        var refreshToken = randToken.uid(256);
                        refreshTokens[refreshToken] = user["phone"];
                        let decoded = jwt.verify(token, secretKey);
                        const client = decoded.user;
                        res.status(200).json({
                            token: token,
                            refresh: refreshToken,
                            currentUser: client
                        });
                    }
                })
            }
            else {
                res.status(401).json({ "success": false, "message": "User not found" })
            }
        })


    },
    changePassword: async (req, res, next) => {
        const { newPassword, passConfirmation } = req.body;
        let token = req.headers['authorization'];
        jwt.verify(token, secretKey, function (e, decoded) {
            if (e) {
                return res.status(403).json({ "success": false, "message": "Invalid bearer token" });
            }
            const client = decoded.user;
            if (newPassword === passConfirmation && newPassword != "" && decoded.user != null && newPassword.length >= 8) {
                bcrypt.hash(newPassword, 10, async (err, hash) => {
                    if (err) { console.log(err); return res.status(400).json({ "success": false, "message": "User not found" }); }
                    User.findOneAndUpdate({ _id: client._id }, { password: hash }, (error, result) => {
                        if (error) { console.log(error); return res.status(400).json({ "success": false, "message": "Unable to update password" }); }
                        else if (result) {
                            return res.status(202).json({ "success": true, "message": "User password updated", "result": result });
                        }
                    })
                })

            } else if (newPassword.length < 8) {
                return res.status(400).json({ "success": false, "message": "password length must be more than 8" })
            }
            else {
                res.status(400).json({ "success": false, "message": "Password cannot be empty" });
            }
        });
        console.log("Expired? ==> ", isTokenExpired(token));
    },
    getCurrentUser: async (req, res) => {
        const token = req.headers['authorization'];
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) return res.status(403).json({ "success": false, "message": "Unauthorized, invalid token" });
            console.log(decoded);
            return res.status(200).json({ "success": true, "message": "Successful user retrieve", "result": decoded.user });
        })
    },
    getNewToken: async (req, res) => {
        const refresh = req.body.refresh;
        const phone = req.body.phone;
        if ((refresh in refreshTokens) && (refreshTokens[refresh] == phone)) {
            User.findOne({ 'phone': phone }).exec(function (err, user) {
                if (err) {
                    return res.status(404).json({ "success": false, "message": "User not found" });
                }
                var data = {
                    phone: user["phone"],
                    _id: user["_id"],
                    user_type: user["user_type"],
                    name: user["name"],
                    city: user["city"],
                    country: user["country"],
                    address: user["address"],
                    zipCode: user["zipCode"],
                }
                var token = jwt.sign({
                    user: data
                }, secretKey, { expiresIn: '14d' });
                var refreshToken = randToken.uid(256);
                refreshTokens[refreshToken] = user["phone"];
                let decoded = jwt.verify(token, secretKey);
                const client = decoded.user;
                res.status(200).json({
                    token: token,
                    refresh: refreshToken,
                    currentUser: client
                });
            })

        } else {
            return res.status(403).json({ "success": false, "message": "Invalid refresh token" });
        }
    },
    adminLogin: async (req, res) => {
        const { phone, password } = req.body;
        User.findOne({ phone: phone }, (err, user) => {
            if (err) res.status(404).json({ "success": false, "message": "User not found" });
            else if (user && user.is_admin) {
                bcrypt.compare(password, user.password, function (error, passMatch) {
                    if (error || !passMatch) { return res.status(401).json({ "success": false, "message": "Password is incorrect" }); }
                    else {
                        let jwtData = {
                            _id: user["_id"],
                            phone: user["phone"],
                            user_type: user["user_type"],
                            name: user["name"],
                            city: user["city"],
                            country: user["country"],
                            address: user["address"],
                            zipCode: user["zipCode"],
                        };
                        var token = jwt.sign({
                            user: jwtData
                        }, secretKey, { expiresIn: '14d' });
                        var refreshToken = randToken.uid(256);
                        refreshTokens[refreshToken] = user["phone"];
                        let decoded = jwt.verify(token, secretKey);
                        const client = decoded.user;
                        res.status(200).json({
                            token: token,
                            refresh: refreshToken,
                            currentUser: client
                        });
                    }
                })
            }
            else if (user && !user.is_admin) {
                res.status(403).json({ "success": false, "message": "Unauthorized Access, please login as Admin" })
            }
            else {
                res.status(401).json({ "success": false, "message": "User not found" })
            }
        })
    }
}
