const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const subCategorySchema = new Schema({ //Sub-categories schema
    parentCategory: {
        type: mongoose.Types.ObjectId,
        ref: 'Category',
    },
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        default: ""
    },
    image: {
        type: String,
        required: true,
    },
    offers: {
        type: [mongoose.Types.ObjectId],
        ref: 'Offer',
        default: []
    }

}, { timestamps: true });

module.exports = mongoose.model('Sub', subCategorySchema);