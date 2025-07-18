import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: `${process.env.EMAIL_PASS}`
  }
});

// Function to send OTP email
export const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Email - Sahara',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Verification</h2>
          <p>This is Sahara. Please use the following OTP to verify your email address:</p>
          <div style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0;">
            <strong>${otp}</strong>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this verification, please ignore this email.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">This is an automated email, please do not reply.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Function to send appointment acceptance email
export const sendAppointmentAcceptanceEmail = async (userEmail, counsellorName, appointmentDate, appointmentTime) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Counsellor Accepted Your Appointment Request - Sahara',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2c3e50; text-align: center;">Appointment Confirmation</h2>
          <p style="color: #34495e; font-size: 16px; line-height: 1.5;">
            Dear valued client,
          </p>
          <p style="color: #34495e; font-size: 16px; line-height: 1.5;">
            We're pleased to inform you that your appointment request has been accepted by your counsellor.
          </p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2c3e50; margin: 0 0 10px;">Appointment Details</h3>
            <p style="color: #34495e; margin: 5px 0;">
              <strong>Counsellor:</strong> ${counsellorName}
            </p>
            <p style="color: #34495e; margin: 5px 0;">
              <strong>Date:</strong> ${appointmentDate}
            </p>
            <p style="color: #34495e; margin: 5px 0;">
              <strong>Time:</strong> ${appointmentTime}
            </p>
          </div>
          <p style="color: #34495e; font-size: 16px; line-height: 1.5;">
            Please ensure you are available at the scheduled time. You can view more details in your Sahara account.
          </p>
          <p style="color: #34495e; font-size: 16px; line-height: 1.5;">
            Thank you for choosing Sahara for your wellness journey!
          </p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px; text-align: center;">
            This is an automated email, please do not reply. For any queries, contact our support team via your Sahara account.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Appointment acceptance email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending appointment acceptance email:', error);
    throw error;
  }

  
};

// Function to send appointment decline email
export const sendAppointmentDeclineEmail = async (userEmail, counsellorName, appointmentDate, appointmentTime, declineReason) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Your Appointment Request Has Been Declined - Sahara',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2c3e50; text-align: center;">Appointment Request Update</h2>
          <p style="color: #34495e; font-size: 16px; line-height: 1.5;">
            Dear valued client,
          </p>
          <p style="color: #34495e; font-size: 16px; line-height: 1.5;">
            We regret to inform you that your appointment request has been declined by the counsellor.
          </p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2c3e50; margin: 0 0 10px;">Appointment Details</h3>
            <p style="color: #34495e; margin: 5px 0;">
              <strong>Counsellor:</strong> ${counsellorName}
            </p>
            <p style="color: #34495e; margin: 5px 0;">
              <strong>Date:</strong> ${appointmentDate}
            </p>
            <p style="color: #34495e; margin: 5px 0;">
              <strong>Time:</strong> ${appointmentTime}
            </p>
            <p style="color: #34495e; margin: 5px 0;">
              <strong>Reason for Decline:</strong> ${declineReason}
            </p>
          </div>
          <p style="color: #34495e; font-size: 16px; line-height: 1.5;">
            We apologize for any inconvenience this may cause. You can schedule a new appointment via your Sahara account.
          </p>
          <p style="color: #34495e; font-size: 16px; line-height: 1.5;">
            Thank you for choosing Sahara for your wellness journey.
          </p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px; text-align: center;">
            This is an automated email, please do not reply. For any queries, contact our support team via your Sahara account.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Appointment decline email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending appointment decline email:', error);
    throw error;
  }
};