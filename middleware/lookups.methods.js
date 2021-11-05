const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config({});
const secretKey = process.env.JWT_SECRET;
const router = require("express").Router();
const Lookup = require("../models/system.lookup.model");
const User = require("../models/user.model");

router.post('/add', (req, res) => {
    let token = req.headers['authorization'];
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err || !decoded) {
            return res.status(403).json({ "success": false, "message": "Invalid Access Token" });
        }
        User.findOne({ _id: decoded.user._id }, async (e, user) => {
            if (e || !user.is_admin) {
                return res.status(401).json({ "success": false, "message": "Must be an admin to access this feature" });
            }
            const classification = req.body.classification;
            let newLookup = new Lookup({
                classification: classification,
            });
            await newLookup.save()
                .then(() => { return res.status(201).json({ "success": true, "message": "System Lookup successfully created" }) })
                .catch((err) => { return res.status(400).json({ "success": false, "message": "Lookup already exists" }) });
        });


    });

});

router.patch("/update", (req, res) => {
    let token = req.headers['authorization'];
    jwt.verify(token, secretKey, async (err, decoded) => {
        if (err || !decoded) {
            return res.status(403).json({ "success": false, "message": "Invalid Access Token" });
        }
        User.findOne({ _id: decoded.user._id }, (e, user) => {
            if (e || !user.is_admin) {
                return res.status(401).json({ "success": false, "message": "Must be an admin to access this feature" });
            }
            const vals = req.body.values;
            let lookup = req.query.lookup;
            Lookup.findOneAndUpdate({ classification: lookup }, { $addToSet: { values: { $each: vals } } })
                .exec(function (err, done) {
                    if (err) { return res.status(400).json({ "success": false, "message": "Unable to update lookup" }) }
                    console.log(done);
                    return res.status(200).json(({ "success": true, "message": "Updated successfully" }));
                });

        });

    });

});

module.exports = router;