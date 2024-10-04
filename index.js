const express = require('express');
const Razorpay = require('razorpay');
const cors = require('cors'); // To handle cross-origin requests
const app = express();
const port = process.env.PORT || 3000;

app.use(cors()); // Enable CORS to allow communication between frontend and backend
app.use(express.json()); // Parse JSON request bodies

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

// Start the server
app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
