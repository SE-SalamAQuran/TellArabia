var router = require("express").Router();
const userControllers = require("../controllers/user.controllers");

router.get('/complaints/all', userControllers.getComplaints);
router.get('/profile', userControllers.profile);
router.get('/orders/all', userControllers.getOrdersList);
router.get('/student/details', userControllers.getStudentDetails);
router.post('/find_user', userControllers.findUser);
router.post('/orders/new', userControllers.newOrder);
router.post('/complaints/new', userControllers.addComplaint);
router.post('/job/submit', userControllers.submitJobRequest);
router.post('/new/wishlist_item', userControllers.createWishListItem);
router.patch('/update/name', userControllers.updateName);
router.patch('/avatar', userControllers.updateAvatar);
router.delete('/delete', userControllers.deleteUser);
router.delete('/delete/order', userControllers.deleteOrder);


module.exports = router;