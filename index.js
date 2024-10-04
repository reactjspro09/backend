const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto'); // To verify the Razorpay signature
const cors = require('cors'); // To handle cross-origin requests
const app = express();
const port = process.env.PORT || 3000;
const nodemailer = require('nodemailer'); // For sending emails
const bodyParser = require('body-parser');
app.use(cors()); // Enable CORS to allow communication between frontend and backend
app.use(express.json()); // Parse JSON request bodies

app.use(bodyParser.json());

app.post('/send-email', async (req, res) => {
  const { to, subject, text } = req.body;

  // Create a transporter object with your email service credentials
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Use your preferred email service
    auth: {
      user: 'tuhinshubhramaiti@gmail.com', // Replace with your email
      pass: 'Tuhin3362@', // Replace with your email password or app password
    },
  });

  // Mail options
  const mailOptions = {
    from: 'tuhinshubhramaiti@gmail.com', // Sender's email
    to, // Receiver's email from request body
    subject, // Subject from request body
    text, // Email body from request body
  };

  // Send email
  try {
    const info = await transporter.sendMail(mailOptions);
    res.status(200).send({ message: 'Email sent successfully!', info });
  } catch (error) {
    res.status(500).send({ message: 'Failed to send email', error });
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
