// const express = require("express");
// const router = express.Router();
// const {
//   createPayment,
//   handlePaymentWebhook,
// } = require("../controllers/payment.controller");

// router.post("/create/:invoiceId", createPayment);
// router.post("/webhook", handlePaymentWebhook);

// module.exports = router;

const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment2.controller");

router.post("/create/:invoiceId", paymentController.createPayment);
router.get("/getId/:orderId", paymentController.getPaymentInfo); //truyền orderCode vào đây
router.put("/cancel/:orderId", paymentController.cancelPayment);
router.post("/webhook/confirm", paymentController.confirmWebhook);
router.post("/webhook", paymentController.handlePaymentWebhook);
router.get("/webhook/info", paymentController.getWebhookInfo);
router.post("/webhook/register", async (req, res) => {
  try {
    const webhookUrl = process.env.PAYOS_WEBHOOK_URL;
    await payosClient.confirmWebhook(webhookUrl);

    return res.status(200).json({
      success: true,
      message: "Webhook URL registered successfully",
      webhookUrl: webhookUrl,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
