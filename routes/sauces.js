require("dotenv").config();

const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const isOwner = require("../middleware/isOwner");
const multer = require("../middleware/multer-config");

const sauceCtrl = require("../controllers/sauces");

router.post("/", auth, multer, sauceCtrl.createSauce);
router.post("/api/auth/login", (req, res) => {
	const userId = req.body.userId;
	const user = { name: userId };

	const accesstoken = jwt.sign(user, process.env.SECRET);
	res.json({ accesstoken: accesstoken });
});
router.put("/:id", isOwner, multer, sauceCtrl.modifySauce);
router.delete("/:id", auth, isOwner, sauceCtrl.deleteSauce);
router.get("/", auth, sauceCtrl.getAllSauce);
router.get("/:id", auth, isOwner, sauceCtrl.getOneSauce);
router.post("/:id/like", auth, sauceCtrl.likeSauce);

module.exports = router;
