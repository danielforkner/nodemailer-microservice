require('dotenv').config();
const express = require('express');
const app = express();
const router = express.Router();
const morgan = require('morgan');
const Mailjet = require('node-mailjet');
const mailjet = new Mailjet({
  apiKey: process.env.MAILJET_APIKEY,
  apiSecret: process.env.MAILJET_SECRET,
});

const sendMail = async (client_name, content) => {
  try {
    const response = await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: process.env.EMAIL,
            Name: client_name,
          },
          To: [
            {
              Email: process.env.PERSONAL_EMAIL,
              Name: 'Home Base',
            },
          ],
          Subject: `Message from ${client_name}`,
          TextPart: `Message from ${client_name}`,
          HTMLPart: get_html_message(client_name, content),
        },
      ],
    });
    console.log('response: ', response);
    return response;
  } catch (error) {
    console.error('error sending mail', error);
    throw error;
  }
};

const get_html_message = (client, content) => {
  return `<h1>MESSAGE FROM ${client}</h1>
  <p>FROM: ${content.name}</p>
  <p>EMAIL: ${content.email}</p>
    <p>MESSAGE: ${content.message}</p>
  `;
};

// middleware
app.use(express.json());
app.use(morgan('dev'));
app.use((req, res, next) => {
  if (req.method !== 'GET') {
    console.log('---Body Logger Start---');
    console.log(req.body);
    console.log('---Body Logger End---');
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
    console.log('mailSentResponse: ', mailSentResponse);
    res.send('Message sent successfully');
  } catch (error) {
    console.error('error on the server', error);
    res.status(500);
    res.send('Failed to deliver message');
  }
});

const PORT = process.env.PORT || 3002;
app.listen(3002, () => console.log('Server is running on port ' + PORT));
