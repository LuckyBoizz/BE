const Invoice = require("../models/invoice.model");
const InvoiceMaintenance = require("../models/invoiceMaintenance.model");
const InvoiceBooking = require("../models/invoiceBooking.model");
const moment = require("moment-timezone");

// Thống kê doanh thu theo khoảng thời gian
const getRevenueByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate dates
    const start = moment(startDate).startOf("day");
    const end = moment(endDate).endOf("day");

    if (!start.isValid() || !end.isValid()) {
      return res.status(400).json({
        success: false,
        message: "Invalid Date",
      });
    }

    // Query doanh thu từ booking
    const bookingRevenue = await InvoiceBooking.aggregate([
      {
        $match: {
          createdAt: { $gte: start.toDate(), $lte: end.toDate() },
          status: "PAID",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$subtotal" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Query chi phí bảo trì
    const maintenanceCosts = await InvoiceMaintenance.aggregate([
      {
        $match: {
          createdAt: { $gte: start.toDate(), $lte: end.toDate() },
          status: "PAID",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$subtotal" },
          count: { $sum: 1 },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        revenue: {
          booking: bookingRevenue[0]?.total || 0,
          bookingCount: bookingRevenue[0]?.count || 0,
        },
        costs: {
          maintenance: maintenanceCosts[0]?.total || 0,
          maintenanceCount: maintenanceCosts[0]?.count || 0,
        },
        profit:
          (bookingRevenue[0]?.total || 0) - (maintenanceCosts[0]?.total || 0),
      },
    });
  } catch (error) {
    console.error("Lỗi thống kê doanh thu:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Thống kê số lượng vé theo loại
const getTicketStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = moment(startDate).startOf("day");
    const end = moment(endDate).endOf("day");

    const ticketStats = await InvoiceBooking.aggregate([
      {
        $match: {
          createdAt: { $gte: start.toDate(), $lte: end.toDate() },
          status: "PAID",
        },
      },
      {
        $unwind: "$tickets",
      },
      {
        $group: {
          _id: "$tickets.ticketType",
          quantity: { $sum: "$tickets.quantity" },
          bonusTickets: { $sum: "$tickets.bonus" },
          revenue: { $sum: "$tickets.totalForTicketType" },
          averagePrice: {
            $avg: {
              $divide: ["$tickets.totalForTicketType", "$tickets.quantity"],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          ticketType: "$_id",
          quantity: 1,
          bonusTickets: 1,
          revenue: 1,
          averagePrice: { $round: ["$averagePrice", 0] },
        },
      },
      {
        $sort: { revenue: -1 },
      },
    ]);

    // Calculate totals
    const totals = ticketStats.reduce((acc, curr) => {
      return {
        totalQuantity: (acc.totalQuantity || 0) + curr.quantity,
        totalBonusTickets: (acc.totalBonusTickets || 0) + curr.bonusTickets,
        totalRevenue: (acc.totalRevenue || 0) + curr.revenue,
      };
    }, {});

    return res.status(200).json({
      success: true,
      data: {
        tickets: ticketStats,
        summary: totals,
      },
    });
  } catch (error) {
    console.error("Lỗi thống kê vé:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Thống kê chi phí bảo trì theo thiết bị
// const getMaintenanceStatistics = async (req, res) => {
//   try {
//     const { startDate, endDate } = req.query;

//     const start = moment(startDate).startOf("day");
//     const end = moment(endDate).endOf("day");

//     const maintenanceStats = await InvoiceMaintenance.aggregate([
//       {
//         $match: {
//           createdAt: { $gte: start.toDate(), $lte: end.toDate() },
//         },
//       },
//       {
//         $unwind: "$equipments",
//       },
//       {
//         $lookup: {
//           from: "types",
//           localField: "equipments.type",
//           foreignField: "_id",
//           as: "typeInfo",
//         },
//       },
//       {
//         $unwind: {
//           path: "$typeInfo",
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       {
//         $group: {
//           _id: "$typeInfo._id",
//           typeName: { $first: "$typeInfo.name" },
//           totalCost: {
//             $sum: "$equipments.price",
//           },
//           equipmentDetails: {
//             $push: {
//               equipmentId: "$equipments._id",
//               code: "$equipments.code",
//               maintenanceCost: "$equipments.price",
//               maintenanceDate: "$createdAt",
//               description: "$equipments.description",
//             },
//           },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           typeName: 1,
//           totalCost: 1,
//           maintenanceCount: { $size: "$equipmentDetails" },
//           equipmentDetails: 1,
//         },
//       },
//       {
//         $sort: { totalCost: -1 },
//       },
//     ]);

//     // Tính tổng chi phí và số lượng bảo trì
//     const summary = {
//       totalMaintenanceCost: maintenanceStats.reduce(
//         (sum, stat) => sum + stat.totalCost,
//         0
//       ),
//       totalMaintenanceCount: maintenanceStats.reduce(
//         (sum, stat) => sum + stat.maintenanceCount,
//         0
//       ),
//       totalTypes: maintenanceStats.length,
//     };

//     return res.status(200).json({
//       success: true,
//       data: {
//         statistics: maintenanceStats,
//         summary,
//       },
//     });
//   } catch (error) {
//     console.error("Lỗi thống kê bảo trì:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
const getMaintenanceStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = moment(startDate).startOf("day");
    const end = moment(endDate).endOf("day");

    const maintenanceStats = await InvoiceMaintenance.aggregate([
      {
        $match: {
          createdAt: { $gte: start.toDate(), $lte: end.toDate() },
          status: "PAID",
        },
      },
      {
        $unwind: "$equipments",
      },
      {
        $group: {
          _id: "$equipments.type", // Nhóm theo tên type trực tiếp
          typeName: { $first: "$equipments.typeName" },
          totalCost: {
            $sum: "$equipments.price",
          },
          equipmentDetails: {
            $push: {
              equipmentId: "$equipments._id",
              code: "$equipments.code",
              maintenanceCost: "$equipments.price",
              maintenanceDate: "$createdAt",
              description: "$equipments.description",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          typeName: 1,
          totalCost: 1,
          maintenanceCount: { $size: "$equipmentDetails" },
          equipmentDetails: 1,
        },
      },
      {
        $sort: { totalCost: -1 },
      },
    ]);

    const summary = {
      totalMaintenanceCost: maintenanceStats.reduce(
        (sum, stat) => sum + stat.totalCost,
        0
      ),
      totalMaintenanceCount: maintenanceStats.reduce(
        (sum, stat) => sum + stat.maintenanceCount,
        0
      ),
      totalTypes: maintenanceStats.length,
    };

    return res.status(200).json({
      success: true,
      data: {
        statistics: maintenanceStats,
        summary,
      },
    });
  } catch (error) {
    console.error("Lỗi thống kê bảo trì:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getRevenueByDateRange,
  getTicketStatistics,
  getMaintenanceStatistics,
};
