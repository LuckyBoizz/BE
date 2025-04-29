// /** @format */
// const CustomerCard = require("../models/customerCard.model.js");

// const getAllCustomerCards = async (req, res) => {
//   try {
//     const customerCard = await CustomerCard.find({});
//     res.status(200).json(customerCard);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// const getCustomerCard = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const customerCard = await CustomerCard.findById(id);
//     res.status(200).json(customerCard);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// const createCustomerCard = async (req, res) => {
//   try {
//     const customerCard = await CustomerCard.create(req.body);
//     res.status(200).json(customerCard);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// const updateCustomerCard = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const customerCard = await CustomerCard.findByIdAndUpdate(id, req.body);

//     if (!customerCard) {
//       return res.status(400).json({ message: "Invalid customerCard data" });
//     }

//     const updatedCustomerCard = await CustomerCard.findById(id);

//     res.status(200).json(updatedCustomerCard);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// const deleteCustomerCard = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const customerCard = await CustomerCard.findByIdAndDelete(id);

//     if (!customerCard) {
//       return res.status(400).json({ message: "Invalid customerCard data" });
//     }

//     res.status(200).json(customerCard);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// module.exports = {
//   getAllCustomerCards,
//   getCustomerCard,
//   createCustomerCard,
//   updateCustomerCard,
//   deleteCustomerCard,
// };
