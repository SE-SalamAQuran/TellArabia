const multer = require('multer');
const methodOverride = require('method-override');
const dotenv = require('dotenv').config({});
const DIR = "../uploads";
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
                "application/pdf",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "application/msword",
                "text/csv",
                "image/bmp",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/vnd.ms-excel",
                "application/vnd.ms-powerpoint",
                "application/vnd.openxmlformats-officedocument.presentationml.presentation"
            ]
        if (
            containsObject(file.mimetype, supported_types)
        ) {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error("Only .png, .jpg and .jpeg, .bmp, .pdf, .docx, .doc, .xlsx, .csv, .xls, .ppt, .pptx formats allowed!"));
        }
    },
});

module.exports = upload;