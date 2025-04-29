/** @format */
const Ticket = require("../models/ticket.model.js");
const Customer = require("../models/customer.model.js");
const Event = require("../models/event.model.js");
const {
  getTodayEvents,
  // getEventDiscountRate,
} = require("./event.controller.js");
const {
  createInvoice,
  generateQRCode,
  generateGuestQRCode,
} = require("./invoice.controller.js");
const { addLoyaltyPoints } = require("./generalUser.controller.js");
const Invoice = require("../models/invoice.model.js");
const QRCode = require("qrcode");
const { json } = require("body-parser");
const InvoiceBooking = require("../models/invoiceBooking.model.js");

const getAllTickets = async (req, res) => {
  try {
    const ticket = await Ticket.find({});
    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findById(id);
    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTicket = async (req, res) => {
  try {
    const ticket = await Ticket.create(req.body);
    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findByIdAndUpdate(id, req.body);

    if (!ticket) {
      return res.status(400).json({ message: "Invalid ticket data" });
    }

    const updatedTicket = await Ticket.findById(id);

    res.status(200).json(updatedTicket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findByIdAndDelete(id);

    if (!ticket) {
      return res.status(400).json({ message: "Invalid ticket data" });
    }

    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const formatNumber = (number) => Math.round(number * 100) / 100;

// const calculatePriceAfterDiscount = async (ticket) => {
//   let discountRate = 0;
//   const events = await getTodayEvents();
//   if (!events || events.length === 0) {
//     return ticket.price; // No events found, return 0 or handle as needed
//   }
//   const event = events[0]; // The first event
//   switch (ticket.ticketType) {
//     case "SuperVip":
//       discountRate = event.discountRateSupervip || 0;
//       // console.log(discountRate);
//       break;
//     case "Vip":
//       discountRate = event.discountRateVip || 0;
//       // console.log(discountRate);
//       break;
//     case "Normal":
//       discountRate = event.discountRateNormal || 0;
//       // console.log(discountRate);
//       break;
//   }
//   return ticket.price * (1 - discountRate / 100);
// };

// const calculateTicketPayment = async (req, res) => {
//   try {
//     const { tickets, customerId } = req.body;
//     if (!tickets || tickets.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "No tickets provided",
//       });
//     }
//     const customer = await Customer.findById(customerId);
//     if (!customer) {
//       return res.status(404).json({
//         success: false,
//         message: "Customer not found",
//       });
//     }

//     let ticketDetails = [];
//     let subtotal = 0;

//     for (const ticketItem of tickets) {
//       const ticket = await Ticket.findById(ticketItem.ticketId);
//       if (!ticket) {
//         return res.status(404).json({
//           success: false,
//           message: `Ticket with ID ${ticketItem.ticketId} not found`,
//         });
//       }
//       const priceAfterEventDiscount = formatNumber(
//         await calculatePriceAfterDiscount(ticket)
//       );
//       const membershipDiscount = Customer.getDiscountMultiplier(
//         customer.cardType
//       );
//       let finalPrice = 0;
//       if (ticketItem.bonus == 2) {
//         finalPrice = formatNumber(
//           (priceAfterEventDiscount + ticketItem.bonus * 20000) *
//             membershipDiscount *
//             ticketItem.quantity
//         );

//         ticketDetails.push({
//           ticketId: ticket._id,
//           ticketType: ticket.ticketType,
//           quantity: ticketItem.quantity,
//           bonus: ticketItem.bonus,
//           bonusAmount: ticketItem.bonus * 20000,
//           originalPrice: formatNumber(ticket.price),
//           priceAfterEventDiscount: formatNumber(priceAfterEventDiscount),
//           membershipDiscount: formatNumber((1 - membershipDiscount) * 100),
//           finalPricePerTicket: formatNumber(
//             (priceAfterEventDiscount + ticketItem.bonus * 20000) *
//               membershipDiscount
//           ),
//           totalForTicketType: formatNumber(finalPrice),
//         });
//       } else {
//         finalPrice = formatNumber(
//           priceAfterEventDiscount * membershipDiscount * ticketItem.quantity
//         );
//         ticketDetails.push({
//           ticketId: ticket._id,
//           ticketType: ticket.ticketType,
//           quantity: ticketItem.quantity,
//           originalPrice: formatNumber(ticket.price),
//           priceAfterEventDiscount: formatNumber(priceAfterEventDiscount),
//           membershipDiscount: formatNumber((1 - membershipDiscount) * 100),
//           finalPricePerTicket: formatNumber(
//             priceAfterEventDiscount * membershipDiscount
//           ),
//           totalForTicketType: formatNumber(finalPrice),
//         });
//       }

//       subtotal += formatNumber(finalPrice);
//     }

//     const paymentData = {
//       success: true,
//       data: {
//         customerInfo: {
//           customerId: customer._id,
//           cardType: customer.cardType,
//         },
//         ticketDetails,
//         summary: {
//           subtotal,
//           totalItems: tickets.reduce((sum, item) => sum + item.quantity, 0),
//           membershipDiscount: `${formatNumber(
//             (1 - Customer.getDiscountMultiplier(customer.cardType)) * 100
//           )}%`,
//         },
//       },
//     };
//     const todayEvents = await getTodayEvents();
//     const discountRates = await getEventDiscountRate(todayEvents);

//     // Create invoice
//     const invoice = await createInvoice(paymentData);

//     // Generate QR code
//     const qrCode = await generateQRCode(invoice);

//     // Update invoice with QR code
//     await Invoice.findByIdAndUpdate(invoice._id, { qrCode });

//     return res.status(200).json({
//       success: true,
//       data: {
//         ...paymentData.data,
//         discountRates,
//         invoice: {
//           invoiceId: invoice._id,
//           invoiceNumber: invoice.invoiceNumber,
//           status: invoice.status,
//           createdAt: invoice.createdAt,
//           qrCode: qrCode,
//         },
//       },
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
const calculateTicketPayment = async (req, res) => {
  try {
    // let discountRate = 0;
    const { tickets, customerId } = req.body;
    if (!tickets || tickets.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No tickets provided",
      });
    }
    const ticket = await Ticket.findById(tickets[0].ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: `Ticket with ID ${tickets[0].ticketId} not found`,
      });
    }
    // console.log(tickets[0].ticketId);
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    let discountRate = 0;

    const events = await getTodayEvents();
    if (events.length != 0) {
      for (const event of events) {
        discountRate += event.discountRate;
      }
    }
    // const event = events[0]; // The first event
    // console.log(event);

    discountRate = formatNumber(discountRate);
    // const discountRate = formatNumber(event.discountRate);
    const priceAfterEventDiscount = formatNumber(
      ticket.price * (1 - discountRate / 100)
    );
    const membershipDiscount = Customer.getDiscountMultiplier(
      customer.cardType
    );
    // let firstTimeDiscount = 0;
    // if (customer.firstTime) {
    //   firstTimeDiscount = 0.1;
    // }
    let ticketDetail = [];
    // let subtotal = 0;
    let finalPrice = formatNumber(
      (priceAfterEventDiscount * tickets[0].quantity +
        tickets[0].bonus * ticket.bonus) *
        membershipDiscount
    );
    ticketDetail.push({
      ticketId: ticket._id,
      ticketType: ticket.ticketType,
      quantity: tickets[0].quantity,
      bonus: tickets[0].bonus,
      bonusAmount: tickets[0].bonus * ticket.bonus,
      originalPrice: formatNumber(ticket.price),
      priceAfterEventDiscount: ticket.price - priceAfterEventDiscount,
      membershipDiscount: formatNumber(
        (1 - membershipDiscount) *
          (priceAfterEventDiscount * tickets[0].quantity +
            tickets[0].bonus * ticket.bonus)
      ),
      // firstTimeDiscount: formatNumber(firstTimeDiscount * 100),
      // firstTimeDiscountAmount: formatNumber(firstTimeDiscount * finalPrice),
      // totalForTicketType: formatNumber(finalPrice * (1 - firstTimeDiscount)),
      totalForTicketType: formatNumber(finalPrice),
    });
    // console.log(ticketDetail);
    const paymentData = {
      type: "booking",
      success: true,
      data: {
        orderCode: Number(String(new Date().getTime()).slice(-6)),
        customerInfo: {
          customerId: customer._id,
          cardType: customer.cardType,
        },
        ticketDetail,
        summary: {
          finalPrice,
          // totalItems: tickets.reduce((sum, item) => sum + item.quantity, 0),
          bonusTicket: tickets[0].bonus,
          totalItems: tickets[0].quantity,
          membershipDiscount: `${formatNumber(
            (1 - Customer.getDiscountMultiplier(customer.cardType)) * 100
          )}%`,
        },
      },
    };
    // Create invoice
    const invoice = await createInvoice(paymentData);

    // Generate QR code
    const qrCode = await generateQRCode(invoice);

    // Update invoice with QR code
    await InvoiceBooking.findByIdAndUpdate(invoice._id, { qrCode, qrCode });

    return res.status(200).json({
      success: true,
      data: {
        ...paymentData.data,
        discountRate,
        invoice: {
          invoiceId: invoice._id,
          invoiceNumber: invoice.invoiceNumber,
          status: invoice.status,
          createdAt: invoice.createdAt,
          qrCode: qrCode,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const calculateForNewMember = async (req, res) => {
  try {
    const { tickets } = req.body;
    if (!tickets || tickets.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No tickets provided",
      });
    }
    const ticket = await Ticket.findById(tickets[0].ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: `Ticket with ID ${tickets[0].ticketId} not found`,
      });
    }

    let discountRate = 0;

    const events = await getTodayEvents();
    if (events.length != 0) {
      for (const event of events) {
        discountRate += event.discountRate;
      }
    }

    discountRate = formatNumber(discountRate);
    const priceAfterEventDiscount = formatNumber(
      ticket.price * (1 - discountRate / 100)
    );

    let ticketDetail = [];
    // let subtotal = 0;
    let finalPrice = formatNumber(
      priceAfterEventDiscount * tickets[0].quantity +
        tickets[0].bonus * ticket.bonus
    );
    ticketDetail.push({
      ticketId: ticket._id,
      ticketType: ticket.ticketType,
      quantity: tickets[0].quantity,
      bonus: tickets[0].bonus,
      bonusAmount: tickets[0].bonus * ticket.bonus,
      originalPrice: formatNumber(ticket.price),
      priceAfterEventDiscount: ticket.price - priceAfterEventDiscount,
      totalForTicketType: formatNumber(finalPrice),
    });
    // console.log(ticketDetail);
    const paymentData = {
      type: "booking",
      success: true,
      data: {
        orderCode: Number(String(new Date().getTime()).slice(-6)),
        customerInfo: {
          customerId: null,
          cardType: null,
        },
        ticketDetail,
        summary: {
          finalPrice,
          // totalItems: tickets.reduce((sum, item) => sum + item.quantity, 0),
          bonusTicket: tickets[0].bonus,
          totalItems: tickets[0].quantity,
        },
      },
    };
    // Create invoice
    const invoice = await createInvoice(paymentData);

    // Generate QR code
    const qrCode = await generateGuestQRCode(invoice);

    // Update invoice with QR code
    await InvoiceBooking.findByIdAndUpdate(invoice._id, { qrCode: qrCode });

    return res.status(200).json({
      success: true,
      data: {
        ...paymentData.data,
        discountRate,
        invoice: {
          invoiceId: invoice._id,
          invoiceNumber: invoice.invoiceNumber,
          status: invoice.status,
          createdAt: invoice.createdAt,
          qrCode: qrCode,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllTickets,
  getTicket,
  createTicket,
  updateTicket,
  deleteTicket,
  calculateTicketPayment,
  calculateForNewMember,
  // calculatePriceAfterDiscount,
};
