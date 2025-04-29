const JWT = require("jsonwebtoken");
// const client = require("../helpers/connection_redis")

const signAccessToken = async (userId, role) => {
	return new Promise((resolve, reject) => {
		const payload = {
			userId,
			role,
		}
		const secret = process.env.JWT_SECRET;
		const options = {
			expiresIn: "1h",
		}
		JWT.sign(payload, secret, options, (err, token) => {
			if (err) {
				return reject(err);
			}
			resolve(token);
		})
	})
}

// const signRefreshToken = async (userId, role) => {
// 	return new Promise((resolve, reject) => {
// 		const payload = {
// 			userId,
// 			role
// 		}
// 		const secret = process.env.JWT_REFRESH_SECRET;
// 		const options = {
// 			expiresIn: "1y",
// 		}
// 		JWT.sign(payload, secret, options, (err, token) => {
// 			if (err) reject(err);
// 			client.set(userId.toString(), token, { EX: 365 * 24 * 60 * 60 })
// 				.then(() => {
// 					resolve(token);
// 				})
// 				.catch(err => {
// 					reject(err);
// 				})
// 		})
// 	})
// }

const verifyAccessToken = (req, res, next) => {
	if (!req.headers.authorization) {
		return res.status(401).send("Unauthorized");
	}

	const authHeader = req.headers.authorization;
	const bearerHeader = authHeader.split(" ");
	const token = bearerHeader[1];
	// verify token
	JWT.verify(token, process.env.JWT_SECRET, (err, payload) => {
		if (err) {
			if (err.name === "TokenExpiredError") {
				return res.status(401).send(err.message);
			}
			return res.status(401).send("Unauthorized");
		}
		req.payload = payload;
		next();
	})
}

// const verifyRefreshToken = async (refreshToken) => {
// 	return new Promise((resolve, reject) => {
// 		JWT.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, payload) => {
// 			if (err) {
// 				return reject(err);
// 			}
// 			client.get(payload.userId)
// 				.then(result => {
// 					console.log(result === refreshToken);
// 					if (refreshToken === result) {
// 						return resolve(payload);
// 					}
// 					reject({ message: "Unauthorized" });
// 				})
// 				.catch(err => {
// 					reject(err);
// 				})
// 		})
// 	})
// }

module.exports = {
	signAccessToken,
	verifyAccessToken,
	// signRefreshToken,
	// verifyRefreshToken,
}