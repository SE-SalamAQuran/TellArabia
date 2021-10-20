const express = require('express');
const cors = require('cors');
const morgan = require("morgan");
const dotenv = require('dotenv').config({});
const mongoose = require("mongoose");
const Offer = require("./models/offer.model");
const jwt = require("jsonwebtoken");
const Order = require("./models/order.model");
const uri = process.env.MONGO_URI;
const port = process.env.PORT;
const secretKey = process.env.JWT_SECRET;
const User = require("./models/user.model");
const app = express();
const userRoutes = require("./routes/user.routes");
const meetingRoutes = require("./routes/meeting.routes");
const adminRoutes = require("./routes/admin.routes");
const servicesRoutes = require('./routes/service.routes');
const authRoutes = require('./routes/auth.routes');
const offerRoutes = require("./routes/offer.routes");
const Student = require('./models/student.model');
const Sub = require("./models/sub_category.model");

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




// app.use('/student', customerRoutes);
app.use('/meetings', meetingRoutes);
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/services', servicesRoutes);
app.use('/admin', adminRoutes);
app.use('/offers', offerRoutes);



app.listen(port, () => {
    console.log(`Server Up on Port ${port}`);
});