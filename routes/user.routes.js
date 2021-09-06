var router = require("express").Router();
const userControllers = require("../controllers/user.controllers");

router.get('/profile', userControllers.profile);
router.get('/orders/all', userControllers.getOrdersList);

module.exports = router;