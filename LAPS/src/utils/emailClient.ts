import nodemailer from "nodemailer";

const sendEmail = async (options: any) => {
  const transporter = nodemailer.createTransport({
    host: String(process.env.EMAIL_SERVICE_HOST),
    port: parseInt(String(process.env.EMAIL_SERVICE_POST)),
    auth: {
      user: String(process.env.EMAIL_SERVICE_USERNAME),
      pass: String(process.env.EMAIL_SERVICE_PASSWORD),
    },
  });

  const mailOptions = {
    from: "<${process.env.EMAIL_FROM}>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
