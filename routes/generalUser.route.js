/** @format */

const express = require("express");
// const { verifyAccessToken, signRefreshToken, verifyRefreshToken} = require("../helpers/jwt_service");
const {
  getAllGeneralUsers,
  getGeneralUserById,
  createGeneralUser,
  updateGeneralUser,
  deleteGeneralUser,
  loginGeneralUser,
  forgotPassword,
  // logoutGeneralUser,
  // refreshToken,
} = require("../controllers/generalUser.controller.js");

const router = express.Router();

router.get("/", getAllGeneralUsers);

router.get("/getId/:id", getGeneralUserById);

router.post("/create", createGeneralUser);

router.put("/update/:id", updateGeneralUser);

router.delete("/:id", deleteGeneralUser);

router.post("/login", loginGeneralUser);

router.post("/forgot-password", forgotPassword);

// router.post("/logout", logoutGeneralUser);

// router.post("/refresh-token", refreshToken);

// router.get("/", verifyAccessToken, getAllGeneralUsers);
//
// router.get("/:id", verifyAccessToken, getGeneralUserById);
//
// router.post("/", verifyAccessToken, createGeneralUser);
//
// router.put("/:id", verifyAccessToken, updateGeneralUser);
//
// router.delete("/:id", verifyAccessToken, deleteGeneralUser);
//
// router.post("/login", loginGeneralUser);
//
// router.post("/logout", verifyAccessToken, logoutGeneralUser);
//
// router.post("/refresh-token", refreshToken);

module.exports = router;
