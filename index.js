require('dotenv').config();
// const cors = require('cors');
const express = require('express');
const app = express();
const router = express.Router();
const nodemailer = require('nodemailer');
const morgan = require('morgan');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

const OAuth2_client = new OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET
);
OAuth2_client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

const getAccessToken = async () => {
  return new Promise((resolve, reject) => {
    OAuth2_client.getAccessToken((err, token) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        console.log('got the token');
        resolve(token);
      }
    });
  });
};

const sendMail = async (client_name, content) => {
  const accessToken = await getAccessToken();
  console.log('accessToken: ', accessToken);

  if (!accessToken) {
    console.log('No access token');
    throw new Error('No access token');
  }

  let mailSentResponse = await asyncSendMail(client_name, content, accessToken);
  console.log('email sent, mailSentResponse: ', mailSentResponse);
};

const asyncSendMail = async (client_name, content, accessToken) => {
  return new Promise((resolve, reject) => {
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: accessToken,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: process.env.PERSONAL_EMAIL,
      subjct: `Message from ${client_name}`,
      html: get_html_message(client_name, content),
    };

    const mailSentResponse = transport.sendMail(
      mailOptions,
      (error, result) => {
        if (error) {
          console.error('error sending mail: ', error);
          reject(false);
        } else {
          transport.close();
          resolve(result.response);
        }
      }
    );
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
app.use(morgan('dev'));
// body logger
app.use((req, res, next) => {
  if (req.method !== 'GET') {
    console.log('Body Logger Start');
    console.log(req.body);
    console.log('Body Logger End');
  }
  next();
});
app.post('/danielforkner', async (req, res) => {
  const { name, email, message } = req.body;
  try {
    let mailSentResponse = await sendMail('danielforkner personalsite', {
      name,
      email,
      message,
    });
    console.log('mailSentResponse: ', mailSentResponse);
    res.send('Message sent successfully');
  } catch (error) {
    console.error(error);
    res.status(500);
    res.send('Failed to deliver message');
  }
});

const PORT = process.env.PORT || 3002;
app.listen(3002, () => console.log('Server is running on port ' + PORT));
