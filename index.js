const express = require('express');
const cors = require('cors');
const morgan = require("morgan");
const dotenv = require('dotenv').config({});
const mongoose = require("mongoose");
const multer = require("multer");
const path = require('path');
const jwt = require("jsonwebtoken");
const Order = require("./models/order.model");
const fs = require('fs');
const uri = process.env.MONGO_URI;
const port = process.env.PORT;
const secretKey = process.env.JWT_SECRET;

const app = express();
const userRoutes = require("./routes/user.routes");
// const businessRoutes = require("./routes/business.routes");
// const uploadRoutes = require("./routes/upload.routes");
const authRoutes = require('./routes/auth.routes');
const { MulterError } = require('multer');
const User = require("./models/user.model");

// DB connection
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const connection = mongoose.connection;

connection.on('open', () => {

    console.log("Connected to DB!");

});

connection.on('error', (err) => {
    console.log(err);
});

//Middleware functions
//CORS to process requests from the react app
app.use(cors());

//Morgan to prompt all requests' results on the console
app.use(morgan("dev"));

//Express to parse JSON data and recieve requests' bodies
app.use(
    express.urlencoded({
        extended: true,
        limit: "150mb",
        parameterLimit: 1000000,
    })
);

app.use(express.json({
    extended: true,
    limit: "150mb"
}));

app.use(multer({ dest: "./uploads" }).array('files', 6));
app.use(express.static(path.join(__dirname, "./uploads")));

// app.use('/student', customerRoutes);
// app.use('/business', businessRoutes);
app.use('/auth', authRoutes);
app.use('/users', userRoutes);

app.post('/orders/new', async (req, res) => {
    t = req.headers['authorization'];
    jwt.verify(t, secretKey, async (err, decoded) => {
        if (err) res.status(403).json({ "Success": false, "Message": "Invalid access token" })
        const files = req.files;
        const { service, subject, language, topic, details, deadline } = req.body;

        const url = req.protocol + "://" + req.get("host") + "/";
        var result = [];
        files.forEach(file => {
            result.push(url + 'uploads/' + file.filename);
        });

        const newOrder = new Order({
            service: service,
            subject: subject,
            language: language,
            topic: topic,
            deadline: deadline,
            details: details,
            attachments: result,
            user: decoded.user._id,
        })

        await newOrder.save()
            .then((order) => {
                User.findOneAndUpdate({ _id: decoded.user._id }, { $push: { orders: order } }).exec(function (e, result) {
                    if (e) return res.status(400).json({ "success": false, "message": "Unable to add order to user" });
                    console.log(result);
                })
                return res.status(201).json({ "success": true, "message": "Successful order upload", "result": "Succeded", "user": decoded.user, "order": order });
            }).catch((e) => {
                return res.status(400).json({ "success": false, "message": "Unsuccessful order upload", "result": "Failure", "user": decoded.user, "error": e });
            });

    })

})
app.get("/uploads/:bin", (req, res) => {
    const bin = req.params.bin;
    var file = "/uploads/" + bin;
    fs.readFile(__dirname + file, function (err, data) {
        if (err) {
            res.writeHead(404);
            res.end(JSON.stringify(err));
            return;
        }
        res.writeHead(200);
        res.end(data);
    });
});

app.listen(port, () => {
    console.log(`Server Up on Port ${port}`);
});