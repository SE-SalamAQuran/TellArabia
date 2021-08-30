const multer = require('multer');
const methodOverride = require('method-override');
const { GridFsStorage } = require('multer-gridfs-storage');
const dotenv = require('dotenv').config({});
const crypto = require('crypto');
const path = require('path');

const storage = new GridFsStorage({
    url: process.env.MONGO_URI,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buff) => {
                if (err) {
                    return reject(err);
                }
                const filename = buff.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'orders_uploads'
                };
                resolve(fileInfo);
            })
        })
    }
});

const upload = multer({ storage: storage });
module.exports = upload;