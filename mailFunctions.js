const nodemailer = require('nodemailer');

const sendMail = async (client_name, content) => {
  let mailSentResponse = await asyncSendMail(client_name, content);
  console.log('email sent, mailSentResponse: ', mailSentResponse);
};

const asyncSendMail = async (client_name, content) => {
  return new Promise((resolve, reject) => {
    const transport = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      Port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: process.env.PERSONAL_EMAIL,
      subject: `Message from ${client_name}`,
      html: get_html_message(client_name, content),
    };

    const mailSentResponse = transport.sendMail(
      mailOptions,
      (error, result) => {
        if (error) {
          console.error('error sending mail');
          reject(error);
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

module.exports = { sendMail };
