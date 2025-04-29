/** @format */

// models/generalUser .js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const GeneralUserSchema = new Schema(
	{
		firstName: {
			type: String,
			required: [true, "Please enter a first name"],
			trim: true,
			maxLength: [50, "First name cannot exceed 50 characters"],
			match: [
				/^[a-zA-ZÀ-ỹ ]+$/u,
				"First name can only contain letters and spaces",
			],
		},
		lastName: {
			type: String,
			required: [true, "Please enter a last name"],
			trim: true,
			maxLength: [50, "Last name cannot exceed 50 characters"],
			match: [
				/^[a-zA-ZÀ-ỹ ]+$/u,
				"Last name can only contain letters and spaces",
			],
		},
		dateOfBirth: { type: Date, required: true },
		phoneNumber: {
			type: String,
			required: true,
			validate: {
				validator: function (phone) {
					// Regex cho số điện thoại Việt Nam:
					// - Số di động: (03|05|07|08|09)+([0-9]{8})
					// - Số cố định: (02)+([0-9]{9})
					const phoneRegex = /^((\+84|84|0)([235789]))([0-9]{8})$/;
					return phoneRegex.test(phone);
				},
				message: (props) =>
					`${props.value} is not a valid phone number! Phone number must be a valid Vietnamese phone number`,
			},
		},
		address: { type: String, required: true },
		email: {
			type: String,
			required: true,
			unique: true,
			match: [
				/^[a-zA-Z0-9._-]+@(gmail\.com|yahoo\.com|outlook\.com|hotmail\.com)$/,
				"Please enter a valid email address",
			],
			validate: {
				validator: function (email) {
					return email.length <= 50;
				},
				message: (props) =>
					`${props.value} is not a valid email! Email must be less than 50 characters`,
			},
		},
		gender: { type: String, required: true },
		username: {
			type: String,
			unique: true,
			required: [true, "Please add a username"],
			trim: true,
			lowercase: true,
			validate: {
				validator: function (username) {
					return username.length <= 20;
				},
				message: (props) => `Username must be less than 20 characters long.`,
			},
			match: [
				/^[a-zA-Z0-9._-]+$/,
				"Username can only contain letters and numbers",
			],
		},
		password: {
			type: String,
			required: [true, "Please add a password"],
			minlength: [6, "Password must be at least 7 characters long"],
			match: [/^\S+$/, "Password cannot contain spaces"],
		},
	},
	{ timestamps: true, discriminatorKey: "__t" },
);

// Hash password before saving
GeneralUserSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next();
	this.password = await bcrypt.hash(this.password, 10);
	next();
});

// Compare password method
GeneralUserSchema.methods.comparePassword = async function (candidatePassword) {
	return await bcrypt.compare(candidatePassword, this.password);
};

// Verify email
GeneralUserSchema.pre("save", function (next) {
	if (this.email) {
		this.email = this.email.toLowerCase().trim();
	}
	next();
});

// Verify phone number
GeneralUserSchema.pre("save", function (next) {
	if (this.isModified("email") && this.email) {
		this.email = this.email.toLowerCase().trim();
	}

	if (this.phoneNumber) {
		// Xóa khoảng trắng và các ký tự đặc biệt
		this.phoneNumber = this.phoneNumber
			.replace(/\s+/g, "")
			.replace(/[-.()+]/g, "");

		// Chuẩn hóa số điện thoại về định dạng 0xxxxxxxxx
		if (this.phoneNumber.startsWith("+84")) {
			this.phoneNumber = "0" + this.phoneNumber.slice(3);
		} else if (this.phoneNumber.startsWith("84")) {
			this.phoneNumber = "0" + this.phoneNumber.slice(2);
		}
	}

	if (this.isModified("firstName") && this.firstName) {
		this.firstName = this.firstName.trim();
	}

	if (this.isModified("lastName") && this.lastName) {
		this.lastName = this.lastName.trim();
	}

	next();
});

module.exports = mongoose.model("GeneralUser", GeneralUserSchema);
