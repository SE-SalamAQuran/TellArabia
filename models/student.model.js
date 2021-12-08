const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator');

const studentSchema = new Schema({
    university: {
        type: String,
        required: true,
    },
    major: {
        type: String,
        required: true,
    },
    degree: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    language: {
        type: String,
        default: ""
    },
    orders: {
        type: [mongoose.Types.ObjectId],
        ref: 'Order',
        default: [],
    },
    userInfo: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
    },
    complaints: {
        type: [mongoose.Types.ObjectId],
        ref: "Complaint",
        default: []
    },
    points: {
        type: Number,
        default: 0
    }

}, { timestamps: true })

const Student = mongoose.model("Student", studentSchema);
module.exports = Student;