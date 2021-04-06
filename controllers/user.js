const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.signup = (req, res, next) => {
	const EMAIL = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-]/;

	if (req.body.email == null || req.body.password == null) {
		return res.status(400).json({ error });
	} else if (!EMAIL.test(req.body.email)) {
		return res.status(400).json({ Error: "Votre email est invalide!" });
	} else {
		bcrypt
			.hash(req.body.password, 10)
			.then((hash) => {
				const user = new User({
					email: req.body.email,
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
	User.findOne({ email: req.body.email })
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
							token: jwt.sign({ userId: user._id }, "RANDOM_TOKEN_SECRET", {
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
