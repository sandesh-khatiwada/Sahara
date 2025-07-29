import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: `${process.env.EMAIL_PASS}`
  }
});

export const sendWelcomeEmail = async (email, fullName, credentials) => {
  try {
    const mailOptions = {
      from: `process.env.EMAIL_USER`,
      to: email,
      subject: 'Welcome to Sahara',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1976d2;">Welcome to Sahara</h2>
          <p>Hello ${fullName},</p>
          <p>Congratulations on starting your new journey with Sahara. Your account has been created successfully. Please find your login credentials below:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Email:</strong> ${credentials.email}</p>
            <p><strong>Password:</strong> ${credentials.password}</p>
          </div>
          <p><strong>Important:</strong> Make sure to change your password from the profie page before getting started to use the app.</p>
          <p>We wish you all the best.</p>
          <br>
          <p>Best regards,<br>Sahara Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
}; 