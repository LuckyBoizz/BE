/** @format */

// const client = require("../helpers/connection_redis");
const User = require("../models/generalUser.model");
const Customer = require("../models/customer.model");
const PlaygroundManager = require("../models/playgroundManager.model");
const Staff = require("../models/staff.model");
// const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../helpers/jwt_service");
const { signAccessToken } = require("../helpers/jwt_service");

// Generic error handler
const handleError = (res, error) => {
	res.status(500).json({ success: false, message: error.message });
};

// Get all users (with optional type filter)
const getAllGeneralUsers = async (req, res) => {
	try {
		const { type } = req.query;
		let query = User.find({});

		if (type && ["Customer", "Staff", "PlaygroundManager"].includes(type)) {
			query = query.where("__t").equals(type);
		}

		const users = await query.select("-password -__v").lean();
		res.json({
			success: true,
			message: "Get all users",
			data: users,
		});
	} catch (error) {
		handleError(res, error);
	}
};

// Get user by ID (works for all types)
const getGeneralUserById = async (req, res) => {
	try {
		const user = await User.findById(req.params.id)
			.select("-password -__v")
			.lean();

		if (!user) {
			return res
				.status(404)
				.json({ success: false, message: "User not found" });
		}

		// Add user type to response
		// user.role = user.__t;
		// delete user.__t;

		res.json({
			success: true,
			message: "User found",
			data: user,
		});
	} catch (error) {
		handleError(res, error);
	}
};

// Create user with specific type
const createGeneralUser = async (req, res) => {
	try {
		const { role, ...userData } = req.body;
		let newUser;

		switch (role) {
			case "Customer":
				newUser = new Customer(userData);
				break;
			case "Staff":
				userData.jobPosition = userData.position;
				console.log(userData);
				newUser = new Staff(userData);
				break;
			case "PlaygroundManager":
				newUser = new PlaygroundManager(userData);
				break;
			case "Admin":
				newUser = new User(userData);
				break;
			default:
				return res.status(400).json({
					success: false,
					message:
						"Invalid user type. Valid types: Customer, Staff, PlaygroundManager",
				});
		}

		await newUser.save();
		const userResponse = newUser.toObject();
		delete userResponse.password;
		delete userResponse.__v;

		res.status(201).json({
			success: true,
			message: "User created successfully",
			data: { ...userResponse, role },
		});
	} catch (error) {
		res.status(400).json({
			success: false,
			message: error.message,
		});
	}
};

// Update user (generic update for all types)
const updateGeneralUser = async (req, res) => {
	try {
		const { role, ...updateData } = req.body;
		const userId = req.params.id;

		// Prevent role changing through update
		if (role) {
			return res.status(400).json({
				success: false,
				message: "User role cannot be modified after creation",
			});
		}

		const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
			new: true,
			runValidators: true,
		})
			.select("-password -__v")
			.lean();

		if (!updatedUser) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		// Add role to response
		updatedUser.role = updatedUser.__t;
		delete updatedUser.__t;

		res.json({
			success: true,
			message: "User update successfully",
			data: updatedUser,
		});
	} catch (error) {
		handleError(res, error);
	}
};

// Delete user (works for all types)
const deleteGeneralUser = async (req, res) => {
	try {
		const deletedUser = await User.findByIdAndDelete(req.params.id)
			.select("-password -__v")
			.lean();

		if (!deletedUser) {
			return res.json({
				success: false,
				message: "User not found",
			});
		}

		res.json({
			success: true,
			message: "User deleted successfully",
			data: deletedUser,
		});
	} catch (error) {
		handleError(res, error);
	}
};

const loginGeneralUser = async (req, res) => {
	try {
		const { username, password, role } = req.body;
		const user = await User.findOne({ username });

		if (!user) {
			return res.json({
				success: false,
				message: "User not registered!!",
			});
		}

		if (!(await user.comparePassword(password))) {
			return res.json({
				success: false,
				message: "Invalid password",
			});
		}

		if (role && user.__t !== role) {
			return res.json({
				success: false,
				message: `User is not a ${role}`,
			});
		}

		const accessToken = await signAccessToken(user._id, user.__t);
		// const refreshToken = await signRefreshToken(user._id, user.__t);

		const userData = user.toObject();
		delete userData.password;
		delete userData.__v;

		res.json({
			success: true,
			message: "User login successfully",
			data: {
				accessToken,
				// refreshToken,
				user: userData,
			},
		});
	} catch (error) {
		handleError(res, error);
	}
};

const addLoyaltyPoints = async (subtotal, customerId) => {
	try {
		const points = Math.floor(subtotal / 10000); // 1 point for every 10000 currency units
		const user = await User.findById(customerId);
		if (!user) {
			throw new Error("User not found");
		}
		user.loyaltyPoints = (user.loyaltyPoints || 0) + points;
		await user.save();
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// const logoutGeneralUser = async (req, res) => {
//   try {
//     const {refreshToken} = req.body;
//     if (!refreshToken) {
//       return res.status(400).json({
//         success: false,
//         message: "Bad request",
//       });
//     }
//
//     const {userId} = await verifyRefreshToken(refreshToken);
//
//     client.del(userId.toString())
//       .then(() => {
//         res.json({
//           success: true,
//           message: "User logged out successfully",
//         })
//       })
//       .catch((err) => {
//         res.status(500).message(err);
//       })
//   } catch (error) {
//     handleError(res, error);
//   }
// };

// const refreshToken = async (req, res) => {
//   try {
//     const { refreshToken } = req.body;
//
//     if (!refreshToken) {
//       return res.status(400).message("Bad request")
//     }
//
//     const payload = await verifyRefreshToken(refreshToken);
//
//     const { userId, role } = payload;
//
//     const accessToken = await signAccessToken(userId, role);
//     const rfToken = await signRefreshToken(userId, role);
//
//     res.json({
//       accessToken,
//       refreshToken: rfToken,
//     })
//   } catch (error) {
//     handleError(res, error);
//   }
// };

module.exports = {
	getAllGeneralUsers,
	getGeneralUserById,
	createGeneralUser,
	updateGeneralUser,
	deleteGeneralUser,
	loginGeneralUser,
	addLoyaltyPoints,
	// logoutGeneralUser,
	// refreshToken,
};
