const express = require('express');
const cors = require('cors');
const morgan = require("morgan");
const dotenv = require('dotenv').config({});
const mongoose = require("mongoose");

const uri = process.env.MONGO_URI;
const port = process.env.PORT;

const app = express();

// const customerRoutes = require("./routes/customer.routes");
// const businessRoutes = require("./routes/business.routes");

const authRoutes = require('./routes/auth.routes');

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
// app.use('/business', businessRoutes);
app.use('/auth', authRoutes);



app.listen(port, () => {
    console.log(`Server Up on Port ${port}`);
});