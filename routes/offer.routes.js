const router = require("express").Router();
const offersController = require("../controllers/offer.controllers");

router.get("/all", offersController.getAllOffers);
router.get("/by_service", offersController.getOffersByService);
router.get('/offer', offersController.getOfferData);
router.get('/user', offersController.getUserOffers);
router.post("/new", offersController.newOffer);


module.exports = router;