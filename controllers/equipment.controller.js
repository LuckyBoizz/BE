/** @format */
const Equipment = require("../models/equipment.model.js");
const { createInvoice } = require("./invoice.controller.js");
const Type = require("../models/type.model.js");
const Supplier = require("../models/supplier.model.js");

const getAllEquipments = async (req, res) => {
  try {
    const equipment = await Equipment.find({});
    res.status(200).json(equipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const equipment = await Equipment.findById(id);
    res.status(200).json(equipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEquipmentByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const equipment = await Equipment.find({ status: status });
    res.status(200).json(equipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createEquipment = async (req, res) => {
  try {
    const { typeName, supplierId, title, ...equipmentData } = req.body;
    // console.log(req.body);
    const type = await Type.findOne({ typeName: typeName });
    // console.log(type);
    const count = type.count + 1;
    const code = type.code + count;
    const equipment = await Equipment.create({ ...req.body, code: code });
    await Type.findOneAndUpdate(type._id, { count });
    // console.log(equipment);
    const equipments = [equipment];
    const importResult = await calculatePriceImportEquipment(
      equipments,
      supplierId,
      title || `Nhập thiết bị mới ${new Date().toLocaleDateString("vi-VN")}`
    );
    console.log(importResult);
    // Cập nhật thiết bị vào supplier
    const updateSupplier = await Supplier.updateOne(
      { _id: supplierId },
      { $push: { equipmentId: equipment._id } }
    );
    if (updateSupplier.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        message: "Cập nhật nhà cung cấp thất bại",
      });
    }
    res.status(200).json({
      success: true,
      data: {
        // equipment,
        // importDetails: importResult,
        invoice: importResult.invoice,
        summary: importResult.summary,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const equipment = await Equipment.findByIdAndUpdate(id, req.body);

    if (!equipment) {
      return res.status(400).json({ message: "Invalid equipment data" });
    }

    const updatedEquipment = await Equipment.findById(id);

    res.status(200).json(updatedEquipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const equipment = await Equipment.findByIdAndDelete(id);

    if (!equipment) {
      return res.status(400).json({ message: "Invalid equipment data" });
    }

    res.status(200).json(equipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const calculatePriceImportEquipment = async (equipments, supplierId, title) => {
  try {
    if (!equipments || !Array.isArray(equipments) || equipments.length === 0) {
      throw new Error("Danh sách thiết bị không hợp lệ");
    }

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      throw new Error("Nhà cung cấp không hợp lệ");
    }

    // Tính tổng chi phí và số lượng
    const totalItems = equipments.length;
    const importCost = equipments.reduce(
      (sum, item) => sum + (item.purchasePrice || 0),
      0
    );

    const importData = {
      type: "maintenance",
      data: {
        title: title,
        orderCode: Number(String(new Date().getTime()).slice(-6)),
        supplierId,
        supplierName: supplier.name,
        equipmentDetail: equipments.map((equipment) => ({
          equipmentId: equipment._id,
          typeName: equipment.typeName,
          code: equipment.code,
          price: equipment.price,
          description: equipment.description || "Nhập thiết bị mới",
        })),
        finalPrice: importCost,
        totalItems,
      },
    };

    // Tạo hóa đơn nhập thiết bị
    const invoice = await createInvoice(importData);

    const returnData = {
      invoice,
      summary: {
        totalItems,
        importCost,
        supplierName: supplier.name,
      },
    };
    // return {
    //   invoice,
    //   summary: {
    //     totalItems,
    //     importCost,
    //     supplierName: supplier.name,
    //   },
    // };
    // console.log(returnData);
    return returnData;
  } catch (error) {
    throw error;
  }
};

const calculatePriceMaintenanceEquipment = async (req, res) => {
  try {
    const { equipments, title, supplierId, maintenanceDate } = req.body;

    if (!equipments || !Array.isArray(equipments) || equipments.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Danh sách thiết bị bảo trì không hợp lệ",
      });
    }
    const supllier = await Supplier.findById(supplierId);
    if (!supllier) {
      return res.status(400).json({
        success: false,
        message: "Nhà cung cấp không tồn tại",
      });
    }
    // Tính tổng chi phí và số lượng
    const totalItems = equipments.reduce((sum, item) => sum + 1, 0);
    const maintenanceCost = equipments.reduce(
      (sum, item) => sum + item.maintenancePrice,
      0
    );
    // console.log(equipments);
    // Tạo dữ liệu cho hóa đơn bảo trì
    const maintenanceData = {
      type: "maintenance",
      data: {
        orderCode: Number(String(new Date().getTime()).slice(-6)),
        title:
          title || `Bảo trì thiết bị ${new Date().toLocaleDateString("vi-VN")}`,
        supplierId,
        maintenanceDate: maintenanceDate || new Date(),
        equipmentDetail: equipments.map((equipment) => ({
          equipmentId: equipment._id,
          typeName: equipment.typeName,
          code: equipment.code,
          maintenancePrice: equipment.maintenancePrice,
          description: equipment.description || "Bảo trì định kỳ",
        })),

        finalPrice: maintenanceCost,
        totalItems,
      },
    };

    // Tạo hóa đơn bảo trì
    const invoice = await createInvoice(maintenanceData);

    // // Cập nhật lịch sử bảo trì cho từng thiết bị
    const updatePromises = equipments.map(async (equipment) => {
      await Equipment.findByIdAndUpdate(equipment._id, {
        $push: {
          maintenanceHistory: {
            invoiceMaintenanceId: invoice._id,
            date: maintenanceDate || new Date(),
            description: equipment.description || "Bảo trì định kỳ",
          },
        },
        status: "Maintenance",
      });
    });

    await Promise.all(updatePromises);

    return res.status(200).json({
      success: true,
      data: {
        invoice,
        summary: {
          totalItems,
          maintenanceCost,
          maintenanceDate: maintenanceDate || new Date(),
        },
      },
    });
  } catch (error) {
    console.error("Lỗi tính toán chi phí bảo trì:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateStatusEquipment = async (req, res) => {
  try {
    const { equipmentId, status } = req.body;
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: "Thiết bị không tồn tại",
      });
    }
    equipment.status = status;
    await equipment.save();
    return res.status(200).json({
      success: true,
      data: equipment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllEquipments,
  getEquipment,
  getEquipmentByStatus,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  calculatePriceImportEquipment,
  calculatePriceMaintenanceEquipment,
  updateStatusEquipment,
};
