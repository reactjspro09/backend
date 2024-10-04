const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto'); // To verify the Razorpay signature
const cors = require('cors'); // To handle cross-origin requests
const app = express();
const port = process.env.PORT || 3000;
const nodemailer = require('nodemailer'); // For sending emails

app.use(cors()); // Enable CORS to allow communication between frontend and backend
app.use(express.json()); // Parse JSON request bodies

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use 'gmail', or your own SMTP provider
  auth: {
    user: 'businesswithtuhin.b@gmail.com', // Replace with your email
    pass: 'Tuhin3362bati', // Replace with your email password or app password
  },
});

// Route to send an email
app.post('/send-email', async (req, res) => {
  const { senderEmail, recipientEmail, subject, message } = req.body;

  // Define email options
  const mailOptions = {
    from: senderEmail,
    to: recipientEmail,
    subject: subject,
    text: message,
  };

  try {
    // Send the email
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send email', error: error.message });
  }
});




// Razorpay instance initialization with API Key and Secret
const razorpay = new Razorpay({
  key_id: 'rzp_live_jo7kU7mTObULQq', // Replace with your Razorpay Key ID
  key_secret: 'vMi0yHNpnt79xnY3LPPGKIul' // Replace with your Razorpay Key Secret
});

// Route to create a Razorpay order
app.post('/create-order', async (req, res) => {
  const { amount, currency } = req.body;

  // Order creation parameters
  const options = {
    amount: amount * 100, // Convert amount to paise (100 paise = 1 INR)
    currency: currency || 'INR', // Default currency is INR
    receipt: `receipt_${Math.floor(Math.random() * 10000)}`, // Unique receipt ID
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json({
      id: order.id,
      currency: order.currency,
      amount: order.amount
    });
  } catch (error) {
    res.status(500).send(error);
  }
});
app.post('/verify-payment', (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  
    // Create the expected signature using HMAC SHA256
    const generated_signature = crypto
      .createHmac('sha256', razorpay.key_secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');
  
    // Verify if the generated signature matches the one sent by Razorpay
    if (generated_signature === razorpay_signature) {
      // Payment is successful and valid
      res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      // Payment verification failed
      res.status(400).json({ success: false, message: 'Payment verification failed' });
    }
  });
// Start the server
app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
