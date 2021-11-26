const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const jobApplicationSchema = new Schema({
    freelancer: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
    },
    resume: {
        type: String, //Url of CV file stored in Firebase
        required: true,
    },
    role: {
        type: String,
    },
    category: {
        type: mongoose.Types.ObjectId,
        ref: "Category",
    },
    field: {
        type: mongoose.Types.ObjectId,
        ref: "Sub"
    },
    sample: {
        type: String,  //URL of file stored in firebase
        required: true
    },
    price_range: {
        type: String,
        required: true
    },
    availability: {
        type: String,
        enum: ["8 hours or more a day", "8 hours or more a week", "8 hours or more a month"],
    }
}, { timestamps: true });

module.exports = mongoose.model("Application", jobApplicationSchema);