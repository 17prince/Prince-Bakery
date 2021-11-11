const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');
// new Email(user, url).sendWelcome()

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstname = user.name.split(' ')[0];
    this.url = url;
    this.from = `Prince Bakery <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // sendgrid
      console.log('working....');
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

    // if we are in developer env.
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Send Actual Email
  async send(template, subject) {
    // 1. Render HTML based on PUG template
    const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
      firstname: this.firstname,
      url: this.url,
      subject,
    });

    // 2. Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
    };

    // 3. Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  // Sending WELCOME email when user creates an account
  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Prince Bakery !');
  }

  // Send reset-password email
  async sendResetPassword() {
    await this.send('passwordReset', 'Your password reset token(valid for only 10 minutes).');
  }
};
