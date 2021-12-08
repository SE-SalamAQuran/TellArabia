const router = require("express").Router();
const adminControllers = require("../controllers/admin.controllers");

router.get("/applications", adminControllers.fetchJobApplications);
router.get("/orders", adminControllers.fetchOrders);
router.get("/complaints", adminControllers.fetchComplaints);
router.get("/meetings", adminControllers.fetchMeetings);
router.get("/services", adminControllers.fetchServices);
router.get("/freelancers", adminControllers.getAllFreelancers);
router.get("/students", adminControllers.getStudents);
router.patch("/points/add", adminControllers.addPointsToStudent);
router.patch("/update/avatar", adminControllers.updatePicture);
router.patch("/update/order", adminControllers.changeOrderStatus);
router.patch("/update/complaint", adminControllers.changeComplaintStatus);


module.exports = router;