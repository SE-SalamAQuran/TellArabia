const router = require("express").Router();
const meetingControllers = require("../controllers/meeting.controllers");

router.post("/new", meetingControllers.addMeeting);
router.get("/all", meetingControllers.getMeetings);

module.exports = router;