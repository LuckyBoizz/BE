/** @format */
const Invoice = require("../models/invoice.model.js");
const InvoiceBooking = require("../models/invoiceBooking.model");
const shortid = require("shortid");
const QRCode = require("qrcode");
const InvoiceMaintenance = require("../models/invoiceMaintenance.model");

const getAllInvoices = async (req, res) => {
  try {
    const invoice = await Invoice.find({});
    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findById(id);
    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generateQRCode = async (invoice) => {
  try {
    // 1. Validate invoice data
    if (!invoice || !invoice._id) {
      throw new Error("Invalid invoice data");
    }

    // 2. Get full invoice data by populating related fields
    let fullInvoice;
    if (invoice.customer) {
      fullInvoice = await InvoiceBooking.findById(invoice._id)
        .populate("customer", "-password")
        .populate("tickets.ticketId");
    } else if (invoice.supplierId) {
      fullInvoice = await InvoiceMaintenance.findById(invoice._id)
        .populate("supplierId")
        .populate("equipments._id");
    }

    if (!fullInvoice) {
      throw new Error("Invoice not found");
    }

    // 3. Create QR data with only available information
    const qrData = {};

    // Add basic invoice info if available
    fullInvoice.invoiceNumber &&
      (qrData.invoiceNumber = fullInvoice.invoiceNumber);
    fullInvoice.orderCode && (qrData.orderCode = fullInvoice.orderCode);

    // Add date and time information
    if (fullInvoice.createdAt) {
      qrData.date = new Date(fullInvoice.createdAt).toLocaleDateString("vi-VN");
      qrData.time = new Date(fullInvoice.createdAt).toLocaleTimeString(
        "vi-VN",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    }

    fullInvoice.status && (qrData.status = fullInvoice.status);
    qrData.type = fullInvoice.customer ? "booking" : "maintenance";

    // Add customer info if available
    if (fullInvoice.customer) {
      qrData.customer = {
        name: `${fullInvoice.customer.firstName} ${fullInvoice.customer.lastName}`.trim(),
      };
      fullInvoice.customer.phoneNumber &&
        (qrData.customer.phone = fullInvoice.customer.phoneNumber);
    }

    // Add ticket info if available
    if (fullInvoice.tickets && fullInvoice.tickets.length > 0) {
      qrData.tickets = fullInvoice.tickets
        .filter((ticket) => ticket.ticketType && ticket.quantity)
        .map((ticket) => ({
          type: ticket.ticketType,
          quantity: ticket.quantity,
          ...(ticket.bonus && { bonus: ticket.bonus }),
        }));
    }

    // Add maintenance info if available
    if (fullInvoice.supplierId) {
      qrData.supplier = {
        name: fullInvoice.supplierId.name,
      };
      fullInvoice.supplierId.phoneNumber &&
        (qrData.supplier.phone = fullInvoice.supplierId.phoneNumber);
    }

    // Add equipment info if available
    if (fullInvoice.equipments && fullInvoice.equipments.length > 0) {
      qrData.equipments = fullInvoice.equipments
        .filter((eq) => eq.code && eq.typeName)
        .map((eq) => ({
          code: eq.code,
          type: eq.typeName,
        }));
    }

    // Add summary info if available
    fullInvoice.subtotal &&
      (qrData.amount = fullInvoice.subtotal.toLocaleString("vi-VN") + " VNĐ");
    fullInvoice.totalItems && (qrData.items = fullInvoice.totalItems);

    // 4. Generate QR code
    const qrString = JSON.stringify(qrData);
    const qrCodeImage = await QRCode.toDataURL(qrString, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 300,
    });

    return qrCodeImage;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw error;
  }
};

const generateGuestQRCode = async (invoice) => {
  try {
    // 1. Validate invoice data
    if (!invoice || !invoice._id) {
      throw new Error("Invalid invoice data");
    }

    // 2. Get full invoice data
    let fullInvoice = await InvoiceBooking.findById(invoice._id).populate(
      "tickets.ticketId"
    );

    if (!fullInvoice) {
      throw new Error("Invoice not found");
    }

    // 3. Create simplified QR data for guest
    const qrData = {
      // Basic invoice info
      invoiceNumber: fullInvoice.invoiceNumber,
      orderCode: fullInvoice.orderCode,
      type: "guest_booking",

      // Date and time
      date: new Date(fullInvoice.createdAt).toLocaleDateString("vi-VN"),
      time: new Date(fullInvoice.createdAt).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),

      // Guest info (simplified)
      guest: {
        ticketCount: fullInvoice.totalItems,
      },

      // Ticket summary
      tickets: fullInvoice.tickets
        .filter((ticket) => ticket.ticketType && ticket.quantity)
        .map((ticket) => ({
          type: ticket.ticketType,
          quantity: ticket.quantity,
          ...(ticket.bonus && { bonus: ticket.bonus }),
        })),

      // Payment info
      amount: fullInvoice.subtotal.toLocaleString("vi-VN") + " VNĐ",
      status: fullInvoice.status,
    };

    // 4. Generate QR code with simplified data
    const qrString = JSON.stringify(qrData);
    const qrCodeImage = await QRCode.toDataURL(qrString, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 300,
    });

    // 5. Update invoice with QR code
    await InvoiceBooking.findByIdAndUpdate(
      invoice._id,
      {
        qrCode: qrCodeImage,
        isGuest: true,
      },
      { new: true }
    );

    return qrCodeImage;
  } catch (error) {
    console.error("Error generating guest QR code:", error);
    throw error;
  }
};

const createInvoice = async (req, res) => {
  try {
    // const { type, ...paymentData } = req.body;
    // console.log(req);
    const type = req.type;
    // console.log(type);
    const paymentData = req.data;
    // console.log(paymentData);
    if (type === "booking") {
      // console.log("booking");
      const invoiceData = {
        invoiceNumber: `INV-${shortid.generate()}`,
        customer: paymentData.customerInfo.customerId,
        orderCode: paymentData.orderCode,
        tickets: paymentData.ticketDetail.map((ticket) => ({
          ticketId: ticket.ticketId,
          ticketType: ticket.ticketType,
          quantity: ticket.quantity,
          bonus: ticket.bonus,
          bonusAmount: ticket.bonusAmount,
          originalPrice: ticket.originalPrice,
          priceAfterEventDiscount: ticket.priceAfterEventDiscount,
          totalForTicketType: ticket.totalForTicketType,
        })),
        subtotal: paymentData.summary.finalPrice,
        membershipDiscount: paymentData.summary.membershipDiscount,
        totalItems: paymentData.summary.totalItems,
        status: "PENDING",
      };
      // console.log(invoiceData);
      const invoice = await InvoiceBooking.create(invoiceData);
      return invoice;
    } else if (type === "maintenance") {
      // console.log("maintenance");
      const invoiceData = {
        invoiceNumber: `INV-${shortid.generate()}`,
        title: paymentData.title,
        supplierId: paymentData.supplierId,
        orderCode: paymentData.orderCode,
        equipments: paymentData.equipmentDetail.map((equipment) => ({
          _id: equipment.equipmentId,
          code: equipment.code,
          typeName: equipment.typeName,
          description: equipment.description,
          price: equipment.maintenancePrice,
        })),
        subtotal: paymentData.finalPrice,
        status: "PENDING",
        totalItems: paymentData.totalItems,
      };
      const invoice = await InvoiceMaintenance.create(invoiceData);
      // console.log(invoice);
      return invoice;
    }
  } catch (error) {
    throw error;
  }
};

const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findByIdAndUpdate(id, req.body);

    if (!invoice) {
      return res.status(400).json({ message: "Invalid invoice data" });
    }

    const updatedInvoice = await Invoice.findById(id);

    res.status(200).json(updatedInvoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findByIdAndDelete(id);

    if (!invoice) {
      return res.status(400).json({ message: "Invalid invoice data" });
    }

    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const findInvoice = async (req, res) => {
  try {
    const { orderCode } = req.params;
    // Create a filter object for the query
    const filter = { orderCode: orderCode };
    const invoice = await Invoice.findOne(filter);

    // const invoice = await Invoice.findOne(orderCode);

    if (!invoice) {
      return res.status(400).json({ message: "Invalid invoice data" });
    }

    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllInvoices,
  getInvoice,
  generateQRCode,
  generateGuestQRCode,
  createInvoice,
  // createInvoiceMaintenance,
  updateInvoice,
  deleteInvoice,
  findInvoice,
};
