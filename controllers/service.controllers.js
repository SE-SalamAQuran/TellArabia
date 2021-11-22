const User = require("../models/user.model");
const Service = require("../models/service.model");
const Category = require("../models/category.model");
const Sub = require("../models/sub_category.model");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config({});
const secretKey = process.env.JWT_SECRET;
const Lookup = require("../models/system.lookup.model");
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

function uploadFile(file) {
    uploader.single("file");
    var downloadUrl = "";
    try {
        if (!file) {
            console.log('Error, could not upload file');
            return;
        }


        // Create new blob in the bucket referencing the file
        const blob = bucket.file(file.name);

        // Create writable stream and specifying file mimetype
        const blobWriter = blob.createWriteStream({
            metadata: {
                contentType: file.mimetype,
            },
        });

        blobWriter.on('error', (err) => next(err));

        blobWriter.on('finish', async (url) => {
            // Assembling public URL for accessing the file via HTTP


            url['ref'] += `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURI(blob.name)}?alt=media`;




            // Return the file name and its public URL
        });

        const url = { ref: "" };
        blobWriter.emit('finish', url);
        blobWriter.end(file.data);
        return url['ref'];
        // When there is no more data to be consumed from the stream

    } catch (error) {
        console.log(`Error, could not upload file: ${error}`);
        return error;
    }
}

function getRandom(arr, n) {
    var result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len) n = len;
    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}

module.exports = {
    addCategory: async (req, res) => {
        let token = req.headers['authorization'];
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) { return res.status(403).json({ "success": false, "message": "Invalid access token" }) }
            else {
                User.findOne({ _id: decoded.user._id }, async (error, user) => {
                    if (error) { return res.status(400).json({ "success": false, "message": "Unable to find user" }) }
                    else if (!user.is_admin) { return res.status(403).json({ "success": false, "message": "Unauthorized access to admin feature" }) }
                    const name = req.body.name;
                    console.log(name);
                    const downLoadUrl = uploadFile(req.files.file);
                    console.log(downLoadUrl);
                    const newCategory = new Category({
                        name: name,
                        url: downLoadUrl,
                        addedBy: user._id,
                    });
                    const newServiceLookup = new Lookup({
                        classification: name.toLowerCase().split(' ').join('_') + '_services',
                    });
                    const newRoleLookup = new Lookup({
                        classification: name.toLowerCase().split(' ').join('_') + "_roles",
                    });
                    const newFieldLookup = new Lookup({
                        classification: name.toLowerCase().split(' ').join('_') + "_fields",
                    });

                    await newServiceLookup.save()
                        .then(() => { console.log(`Added new Lookup for ${name} services`) })
                        .catch((E) => {
                            console.log(`Unable to add lookup for ${name} services`);
                            return;

                        });
                    await newRoleLookup.save()
                        .then(() => { console.log(`Added new Lookup for ${name} roles`) })
                        .catch((E) => {
                            console.log(`Unable to add lookup for ${name} roles`);
                            return;

                        });
                    await newFieldLookup.save()
                        .then(() => { console.log(`Added new Lookup for ${name} fields`) })
                        .catch((E) => {
                            console.log(`Unable to add lookup for ${name} fields`);
                            return;
                        });
                    await newCategory.save()
                        .then(async (result) => {
                            const newService = new Service({
                                main_category: result._id,
                                sub_categories: [],
                            });

                            Lookup.findOneAndUpdate({ classification: "main_services" }, { $addToSet: { values: result.name } })
                                .exec(async (e, done) => {
                                    if (e) { return res.status(400).json({ "success": false, "message": "Failed to update system lookup:  main_services" }) }

                                    await newService.save().then((service) => { return res.status(201).json({ "success": true, "message": "Service category added successfully", "result": service }) })
                                        .catch((insertError) => { return res.status(400).json({ "success": false, "message": "Error adding service, already exists", "error": insertError }) });
                                });

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
                                        image: sub.url,
                                        description: sub.description,
                                        addedBy: user._id,
                                    });
                                    await newSubCategory.save()
                                        .then((subCat) => {
                                            //Filtered names of main category to find it's lookups
                                            let filteredServiceName = main.toLowerCase().split(' ').join('_') + '_services';

                                            Lookup.findOneAndUpdate({ classification: filteredServiceName }, { $addToSet: { values: sub.name } })
                                                .then(() => {
                                                    console.log(`Lookup updated for this service ${main}`);
                                                })
                                                .catch((error) => { console.log(`Lookup for this service ${main} wasn't updated`); })
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
                var services = {};
                Service.find({})
                    .populate('main_category')
                    .populate('sub_categories')
                    .populate({
                        path: 'sub_categories',
                        populate: {
                            path: 'offers'
                        }
                    }).populate({
                        path: 'sub_categories',
                        populate: {
                            path: 'offers',
                            populate: {
                                path: 'addedBy',

                            }
                        }
                    })
                    .populate({
                        path: 'sub_categories',
                        populate: {
                            path: 'offers',
                            populate: {
                                path: 'addedBy',
                                populate: {
                                    path: "userInfo"
                                }
                            }
                        }
                    })
                    .then((result) => {

                        return res.status(200).json({ "success": true, "result": result });

                    }).catch((error) => {
                        return res.status(400).json({ "success": false, "message": "Unable to find services" });

                    });
            }
        })
    },

    getPopularServices: async (req, res) => {
        let token = req.headers['authorization'];
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) { return res.status(403).json({ "success": false, "message": "Invalid access token" }) }
            else {

                Service.find({})
                    .populate('main_category')
                    .populate('sub_categories')
                    .populate({
                        path: 'sub_categories',
                        populate: {
                            path: 'offers',
                            select: '-service -createdAt -addedBy -__v -updatedAt -orders'
                        },

                    })
                    .populate({
                        path: 'sub_categories',
                        populate: {
                            path: 'parentCategory',
                            select: 'name -_id'
                        }
                    }
                    )
                    .exec(function (e, result) {
                        if (e) { return res.status(404).json({ "success": false, "message": "No services found", "Error": e }) }
                        let sub_arr = [];
                        result.forEach((item) => {
                            sub_arr.push(getRandom(item.sub_categories, 5));
                        });

                        return res.status(200).json({ "success": true, "result": sub_arr.flat() });
                    });
            }

        })
    }

}