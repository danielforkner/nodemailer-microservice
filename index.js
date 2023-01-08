require('dotenv').config();
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const { sendMail } = require('./mailFunctions');

const app = express();
const router = express.Router();

// middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use((req, res, next) => {
  if (req.method !== 'GET') {
    console.log('Body Logger Start');
    console.log(req.body);
    console.log('Body Logger End');
  }
  next();
});

// routes
app.post('/danielforkner', async (req, res) => {
  const { name, email, message } = req.body;
  try {
    let mailSentResponse = await sendMail('danielforkner personalsite', {
      name,
      email,
      message,
    });
    res.send({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('error on the server', error);
    res.status(500);
    res.send({ message: 'Failed to deliver message' });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(3002, () => console.log('Server is running on port ' + PORT));
