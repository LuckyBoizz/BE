const payosClient = require("../config/payos");
const Invoice = require("../models/invoice.model");
const { addLoyaltyPoints } = require("../controllers/generalUser.controller");

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

    const paymentData = {
      orderCode: invoice.orderCode,
      amount: invoice.subtotal,
      description: `Payment for ${invoice.invoiceNumber}`,
      cancelUrl: `${process.env.FRONTEND_URL}/user/payment/cancel`,
      returnUrl: `${process.env.FRONTEND_URL}/user/payment/success`,
    };

    const paymentLink = await payosClient.createPaymentLink(paymentData);

    await Invoice.findByIdAndUpdate(invoiceId, {
      paymentUrl: paymentLink.checkoutUrl,
      paymentOrderCode: paymentLink.orderCode,
    });

    return res.status(200).json({
      success: true,
      data: {
        bin: paymentLink.bin,
        paymentUrl: paymentLink.checkoutUrl,
        accountNumber: paymentLink.accountNumber,
        accountName: paymentLink.accountName,
        amount: paymentLink.amount,
        description: paymentLink.description,
        orderCode: paymentLink.orderCode,
        qrCode: paymentLink.qrCode,
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

const getPaymentInfo = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await payosClient.getPaymentLinkInformation(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Get payment info error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const cancelPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { cancellationReason } = req.body;

    const order = await payosClient.cancelPaymentLink(
      orderId,
      cancellationReason
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Cancel payment error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const confirmWebhook = async (req, res) => {
  try {
    // Get base URL from environment variable
    const webhookUrl = process.env.PAYOS_WEBHOOK_URL;

    // Call PayOS SDK with the URL string directly
    const result = await payosClient.confirmWebhook(webhookUrl);
    console.log("Webhook confirmation result:", result);

    return res.status(200).json({
      success: true,
      message: "Webhook confirmed successfully",
      data: {
        webhookUrl,
        result,
      },
    });
  } catch (error) {
    console.error("Webhook confirmation error:", {
      message: error.message,
      code: error.code,
      url: process.env.PAYOS_WEBHOOK_URL,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to confirm webhook",
      error: error.message,
      code: error.code || "UNKNOWN",
    });
  }
};

const handlePaymentWebhook = async (req, res) => {
  try {
    const { invoiceId, status } = req.body;
    // const signature = req.headers["x-payos-signature"];

    // if (process.env.NODE_ENV !== "production") {
    //   console.log("Skipping signature verification in development mode");
    // } else {
    //   const isValid = await payosClient.validateSignature(signature, req.body);
    //   if (!isValid) {
    //     return res.status(400).json({
    //       success: false,
    //       message: "Invalid webhook signature",
    //     });
    //   }
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
    await addLoyaltyPoints(invoice.subtotal, invoice.customer);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook handling error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getWebhookInfo = async (req, res) => {
  try {
    // Lấy webhook URL từ environment variable
    const webhookUrl = process.env.PAYOS_WEBHOOK_URL;

    // Thêm logging để debug
    console.log("Current webhook URL:", webhookUrl);

    return res.status(200).json({
      success: true,
      data: {
        webhookUrl,
        environment: process.env.NODE_ENV || "development",
        ngrokUrl: "http://localhost:4040/inspect/http", // URL để kiểm tra ngrok
      },
    });
  } catch (error) {
    console.error("Get webhook info error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createPayment,
  getPaymentInfo,
  cancelPayment,
  confirmWebhook,
  handlePaymentWebhook,
  getWebhookInfo,
};
