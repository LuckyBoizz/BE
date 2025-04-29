/** @format */
const Type = require("../models/type.model.js");

const getAllTypes = async (req, res) => {
  try {
    const type = await Type.find({});
    res.status(200).json(type);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getType = async (req, res) => {
  try {
    const { id } = req.params;
    const type = await Type.findById(id);
    res.status(200).json(type);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createType = async (req, res) => {
  try {
    const type = await Type.create(req.body);
    res.status(200).json(type);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateType = async (req, res) => {
  try {
    const { id } = req.params;
    const type = await Type.findByIdAndUpdate(id, req.body);

    if (!type) {
      return res.status(400).json({ message: "Invalid type data" });
    }

    const updatedType = await Type.findById(id);

    res.status(200).json(updatedType);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteType = async (req, res) => {
  try {
    const { id } = req.params;
    const type = await Type.findByIdAndDelete(id);

    if (!type) {
      return res.status(400).json({ message: "Invalid type data" });
    }

    res.status(200).json(type);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllTypes,
  getType,
  createType,
  updateType,
  deleteType,
};
