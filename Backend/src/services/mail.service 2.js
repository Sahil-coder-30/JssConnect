import nodemailer from "nodemailer";
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GOOGLE_USER,
    // clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    // refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    // clientId: process.env.GOOGLE_CLIENT_ID,
    pass: process.env.GOOGLE_APP_PASSWORD
  }
});

transporter
  .verify()
  .then(() => {
    console.log("Email transporter is ready to send email...");
  })
  .catch((err) => {
    console.error("Email transporter verification failed...", err);
  });

export async function sendEmail({ to , subject, html, text }) {
  const mailOptions = {
    from: process.env.GOOGLE_USER,
    to,
    subject,
    html,
    text,
  };

  const mailInfo = await transporter.sendMail(mailOptions);
  console.log("Email sent", mailInfo);
  return mailInfo;
}
