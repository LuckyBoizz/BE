const payosClient = require("../config/payos");
const Invoice = require("../models/invoice.model");

const createPayment = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }
    // Tạo mã đơn hàng dạng số
    const orderCode = parseInt(Date.now());

    const paymentData = {
      // orderCode: invoice.invoiceNumber,
      orderCode: orderCode,
      amount: invoice.subtotal,
      description: `Payment for ${invoice.invoiceNumber}`,
	    cancelUrl: `${process.env.FRONTEND_URL}/user/payment/cancel?invoiceId=${invoiceId}`,
	    returnUrl: `${process.env.FRONTEND_URL}/user/payment/success?invoiceId=${invoiceId}`,
    };

    const paymentLink = await payosClient.createPaymentLink(paymentData);

    await Invoice.findByIdAndUpdate(invoiceId, {
      paymentUrl: paymentLink.checkoutUrl,
      paymentOrderCode: paymentLink.orderCode,
    });

    return res.status(200).json({
      success: true,
      data: {
        paymentUrl: paymentLink.checkoutUrl,
        orderCode: paymentLink.orderCode,
      },
    });
  } catch (error) {
    console.error("Payment creation error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const handlePaymentWebhook = async (req, res) => {
  try {
    const { invoiceId, orderCode, status, amount } = req.body;

    const signature = req.headers["x-payos-signature"];

    // Skip signature verification in development
    if (process.env.NODE_ENV !== "production") {
      console.log("Skipping signature verification in development mode");
    } else {
      // TODO: Implement proper signature verification in production
      // const isValid = await payOS.validateSignature(signature, req.body);
      // if (!isValid) {
      //   return res.status(400).json({
      //     success: false,
      //     message: "Invalid webhook signature",
      //   });
      // }
    }

    // const isValid = payOS.verifyWebhookSignature(
    //   req.body,
    //   req.headers["x-payos-signature"]
    // );

    // if (!isValid) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Invalid webhook signature",
    //   });
    // }

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    invoice.status = status === "PAID" ? "PAID" : "PENDING";
    await invoice.save();

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook handling error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createPayment,
  handlePaymentWebhook,
};
