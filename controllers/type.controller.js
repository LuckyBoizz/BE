/** @format */
const Type = require("../models/type.model.js");
const Equipment = require("../models/equipment.model.js");
const getAllTypes = async (req, res) => {
  try {
    const type = await Type.find({});
    const quantity = type.map((item) => {
      return {
        id: item._id,
        typeName: item.typeName,
        count: item.count,
        code: item.code,
        equipments: item.equipments.map((eq) => ({
          equipmentId: eq.equipmentId,
          code: eq.code,
        })),
        quantity: item.equipments.length,
      };
    });
    res.status(200).json(quantity);
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
    const type = await Type.findById(id);
    if (!type) {
      return res.status(404).json({ message: "Type not found" });
    }

    // Delete all equipments related to this type
    await Equipment.deleteMany({
      _id: { $in: type.equipments.map((eq) => eq.equipmentId) },
    });

    // Delete the type
    await Type.findByIdAndDelete(id);

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
