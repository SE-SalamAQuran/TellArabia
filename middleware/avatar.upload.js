const multer = require('multer');
const methodOverride = require('method-override');
const dotenv = require('dotenv').config({});
const DIR = "../avatarw";
let fs = require("fs"),
    path = require("path");

const storage = new multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DIR);
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + path.extname(file.originalname));
    },
});

function containsObject(obj, array) {
    var i;
    for (i = 0; i < array.length; i++) {
        if (array[i] === obj) {
            return true;
        }
    }
    return false;
}

var upload = new multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const supported_types =  //List of supported file types
            [
                "image/png",
                "image/jpeg",
                "image/jpg",
                "image/bmp",
            ]
        if (
            containsObject(file.mimetype, supported_types)
        ) {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error("Only .png, .jpg and .jpeg, .bmp formats are allowed!"));
        }
    },
});

module.exports = upload;