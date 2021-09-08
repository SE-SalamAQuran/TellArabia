const router = require("express").Router();
const authControllers = require("../controllers/auth.controllers");

router.get("/current_user", authControllers.getCurrentUser);
router.post("/register", authControllers.registerUser);
router.post("/login", authControllers.login);
router.patch("/change_password", authControllers.changePassword);


module.exports = router;