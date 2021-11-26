const router = require("express").Router();
const adminControllers = require("../controllers/admin.controllers");

router.get("/applications", adminControllers.fetchJobApplications);
router.get("/orders", adminControllers.fetchOrders);
router.get("/complaints", adminControllers.fetchComplaints);
router.get("/meetings", adminControllers.fetchMeetings);
router.get("/services", adminControllers.fetchServices);

module.exports = router;