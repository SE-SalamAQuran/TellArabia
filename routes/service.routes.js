const router = require("express").Router();
const serviceControllers = require("../controllers/service.controllers");

router.get("/all", serviceControllers.getServicesByCategory);
router.get("/", serviceControllers.getAllServices);
router.post("/new", serviceControllers.addNewService);


module.exports = router;