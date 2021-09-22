const router = require("express").Router();
const serviceControllers = require("../controllers/service.controllers");

router.get("/all", serviceControllers.getServicesByCategory);
router.post("/new", serviceControllers.addNewService);

module.exports = router;