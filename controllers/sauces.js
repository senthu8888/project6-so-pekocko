const Sauce = require("../models/sauces");
const fs = require("fs");

exports.createSauce = (req, res, next) => {
	const sauceObject = JSON.parse(req.body.sauce);
	delete sauceObject._id;
	const sauce = new Sauce({
		...sauceObject,
		imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
	});

	sauce
		.save()
		.then(() => res.status(201).json({ message: "Votre sauce est enregistré !" }))
		.catch((error) => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
	Sauce.findOne({ _id: req.params.id })
		.then((sauce) => {
			console.log("Propriétaire de la sauce " + sauce.userId);
			res.status(200).json(sauce);
		})
		.catch((error) => {
			res.status(404).json({
				error: error,
			});
		});
};

exports.modifySauce = (req, res, next) => {
	Sauce.findOne({ _id: req.params.id }).then((sauce) => {
		const filename = sauce.imageUrl.split("/images/")[1];
		fs.unlinkSync(`images/${filename}`);
	});
	const sauceObject = req.file
		? {
				...JSON.parse(req.body.sauce),
				imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
		  }
		: { ...req.body };
	if (req.params.id !== req.body.userId) {
		Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
			.then(() => res.status(200).json({ message: "Votre sauce est modifié !" }))
			.catch((error) => res.status(400).json({ error }));
	} else {
		res.status(404).json({ message: "pas d'accès !" });
	}
};

exports.deleteSauce = (req, res, next) => {
	Sauce.findOne({ _id: req.params.id })
		.then((sauce) => {
			const filename = sauce.imageUrl.split("/images/")[1];
			fs.unlink(`images/${filename}`, () => {
				Sauce.deleteOne({ _id: req.params.id })
					.then(() => res.status(200).json({ message: "Sauce supprimé !" }))
					.catch((error) => res.status(400).json({ error }));
			});
		})
		.catch((error) => res.status(500).json({ error }));
};

exports.getAllSauce = (req, res, next) => {
	Sauce.find()
		.then((sauces) => {
			res.status(200).json(sauces);
		})
		.catch((error) => {
			res.status(400).json({ error });
		});
};

exports.likeSauce = (req, res, next) => {
	if (req.body.like === 1) {
		Sauce.updateOne(
			{ _id: req.params.id },
			{ $push: { usersLiked: req.body.userId }, $inc: { likes: +1 } }
		)
			.then(() => {
				res.status(200).json({ message: "Like a été pris en compte !" });
			})
			.catch((error) => res.status(400).json({ error }));
	}
	if (req.body.like === -1) {
		Sauce.updateOne(
			{ _id: req.params.id },
			{ $push: { usersDisliked: req.body.userId }, $inc: { dislikes: +1 } }
		)
			.then(() => {
				res.status(200).json({ message: "Dislike a été pris en compte!" });
			})
			.catch((error) => res.status(400).json({ error }));
	}
	if (req.body.like === 0) {
		Sauce.findOne({ _id: req.params.id })
			.then((sauce) => {
				if (sauce.usersLiked.find((user) => user === req.body.userId)) {
					Sauce.updateOne(
						{ _id: req.params.id },
						{ $pull: { usersLiked: req.body.userId }, $inc: { likes: -1 } }
					)
						.then(() => res.status(200).json({ message: "Ton Like a été retiré!" }))
						.catch((error) => res.status(400).json({ error }));
				}
				if (sauce.usersDisliked.find((user) => user === req.body.userId)) {
					Sauce.updateOne(
						{ _id: req.params.id },
						{ $pull: { usersDisliked: req.body.userId }, $inc: { dislikes: -1 } }
					)
						.then(() => res.status(200).json({ message: "Ton Dislike a été retiré !" }))
						.catch((error) => res.status(400).json({ error }));
				}
			})
			.catch((error) => res.status(404).json({ error }));
	}
};
