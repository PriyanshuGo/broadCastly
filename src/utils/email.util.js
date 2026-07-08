// utils/email.util.js
import nodemailer from "nodemailer";

const sendEmailOtp = async (email, otp) => {
  try {
    // Transporter setup (use your real credentials or a test service like Mailtrap)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const message = {
      from: `"Priyanshu Clothing brand" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your OTP for Registration",
      html: `<h2>Welcome to clothing brand</h2>
             <p>Your OTP for registration is:</p>
             <h3 style="color:#2c3e50;">${otp}</h3>
             <p>This OTP will expire in 5 minutes.</p>`,
    };

    await transporter.sendMail(message);
    console.log(`📧 OTP sent successfully to ${email}`);
  } catch (err) {
    console.error("❌ Email sending failed:", err);
  }
};

export { sendEmailOtp };
