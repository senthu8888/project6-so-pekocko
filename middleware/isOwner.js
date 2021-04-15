const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {
	try {
		const authHeader = req.headers["authorization"];
		const token = authHeader && authHeader.split(" ")[1];
		const decodedToken = jwt.verify(token, process.env.SECRET);
		const userId = decodedToken.userId;
		console.log("Personne connectée " + userId);
		if (req.body.userId && req.body.userId !== userId) {
			throw "User ID non valable";
		} else {
			next();
		}
	} catch {
		res.status(401).json({
			error: new Error("Requête non valide!"),
		});
	}
};
