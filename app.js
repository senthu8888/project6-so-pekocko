const express = require("express");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const sauceRoutes = require("./routes/sauces");
const userRoutes = require("./routes/user");

require("dotenv").config();

mongoose
	.connect(process.env.URL_CONNECT, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => console.log("Connexion à MongoDB réussie !"))
	.catch(() => console.log("Connexion à MongoDB échouée !"));

const app = express();

app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
	);
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
	next();
});

app.get("/", (req, res) => {
	res.send("Bienvenue à So Pekocko");
});

app.get("/api/auth/login", (req, res) => {
	res.send("Accès interdit");
});

// app.put("/api/sauces/:id", (req, res) => {
// 	res.send("Accès interdit");
// 	console.log("Accès interdit");
// });

app.put("/api/sauces", (req, res) => {
	res.send("Accès refusé");
});

// app.get("/api/sauces", (req, res) => {
// 	res.send("Accès refusé");
// });

// app.use(setUser);

// function setUser(req, res, next) {
// 	const userId = req.body.userId;
// 	if (userId) {
// 		req.user = user.find((user) => user.id === userId);
// 	}
// 	next();
// }
app.use(bodyParser.json());

app.use("/api/sauces", sauceRoutes);
app.use("/api/auth", userRoutes);
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(helmet());

module.exports = app;
