const router = require("express").Router();
const adminControllers = require("../controllers/admin.controllers");

router.get("/orders", adminControllers.getAllOrders);

module.exports = router;