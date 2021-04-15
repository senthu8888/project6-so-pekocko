const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

let crypto = require("crypto");

const User = require("../models/User");
require("dotenv").config();

exports.signup = (req, res, next) => {
	const EMAIL = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-]/;
	let text = req.body.email;

	let encryptedMail = crypto
		.createCipher("aes-256-ctr", process.env.EMAIL_MAIL)
		.update(text, "utf-8", "hex");
	let decryptedMail = crypto
		.createDecipher("aes-256-ctr", process.env.EMAIL_MAIL)
		.update(encryptedMail, "hex", "utf-8");

	console.log(encryptedMail);
	console.log(decryptedMail);

	if (req.body.email == null || req.body.password == null) {
		return res.status(400).json({ error });
	} else if (!EMAIL.test(req.body.email)) {
		return res.status(400).json({ Error: "Votre email est invalide!" });
	} else {
		bcrypt
			.hash(req.body.password, 10)
			.then((hash) => {
				const user = new User({
					email: encryptedMail,
					password: hash,
				});
				user.save()
					.then(() => res.status(201).json({ message: "Compte crée !" }))
					.catch((error) => res.status(400).json({ error }));
			})
			.catch((error) => res.status(500).json({ error }));
	}
};

exports.login = (req, res, next) => {
	let text = req.body.email;

	let encryptedMail = crypto
		.createCipher("aes-256-ctr", process.env.EMAIL_MAIL)
		.update(text, "utf-8", "hex");
	let decryptedMail = crypto
		.createDecipher("aes-256-ctr", process.env.EMAIL_MAIL)
		.update(encryptedMail, "hex", "utf-8");

	console.log(encryptedMail);
	console.log(decryptedMail);

	User.findOne({ email: encryptedMail })
		.then((user) => {
			if (!user) {
				return res.status(401).json({ error: "Utilisateur non trouvé !" });
			}
			bcrypt
				.compare(req.body.password, user.password)
				.then((valid) => {
					if (!valid) {
						return res.status(401).json({ error: "Mot de passe incorrect !" });
					} else {
						res.status(200).json({
							userId: user._id,
							token: jwt.sign({ userId: user._id }, process.env.SECRET, {
								expiresIn: "24h",
							}),
						});
						console.log("Vous êtes bien connecté!");
					}
				})
				.catch((error) => res.status(500).json({ error }));
		})
		.catch((error) => res.status(500).json({ error }));
};
