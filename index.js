require('dotenv').config();
// const cors = require('cors');
const express = require('express');
const app = express();
const router = express.Router();
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

const OAuth2_client = new OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET
);
OAuth2_client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

const sendMail = (client_name, content) => {
  const accessTOken = OAuth2_client.getAccessToken();
  const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.EMAIL,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
      accessToken: accessTOken,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: process.env.PERSONAL_EMAIL,
    subjct: `Message from ${client_name}`,
    html: get_html_message(client_name, content),
  };

  transport.sendMail(mailOptions, (error, result) => {
    if (error) {
      throw error;
    } else {
      console.log('Email sent: ' + result.response);
    }
    transport.close();
  });
};

const get_html_message = (client, content) => {
  return `<h1>MESSAGE FROM ${client}</h1>
  <p>FROM: ${content.name}</p>
  <p>EMAIL: ${content.email}</p>
    <p>MESSAGE: ${content.message}</p>
  `;
};

// app.use(cors());
app.use(express.json());
app.post('/danielforkner', (req, res) => {
  const { name, email, message } = req.body;
  try {
    sendMail('danielforkner personalsite', { name, email, message });
    res.send('Message sent successfully');
  } catch (error) {
    console.error(error);
    res.status(500);
    res.send('Failed to deliver message');
  }
});

const PORT = process.env.PORT || 3002;
app.listen(3002, () => console.log('Server is running on port ' + PORT));
