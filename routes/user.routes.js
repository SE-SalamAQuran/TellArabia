var router = require("express").Router();
const userControllers = require("../controllers/user.controllers");

router.get('/complaints/all', userControllers.getComplaints);
router.get('/profile', userControllers.profile);
router.get('/orders/all', userControllers.getOrdersList);
router.post('/find_user', userControllers.findUser);
router.post('/complaints/new', userControllers.addComplaint);

module.exports = router;