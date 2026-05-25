const nodemailer = require("nodemailer");

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT),
  secure: false,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Send booking confirmation to user
const sendBookingConfirmation = async (userEmail, bookingDetails) => {
  const { transactionId, movieTitle, cinema, seats, totalPrice, showTime } =
    bookingDetails;

  const mailOptions = {
    from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
    to: userEmail,
    subject: "Booking Confirmation - CINEBOOK",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #000 0%, #1a1a1a 100%); color: #f5c518; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .ticket { background: white; padding: 20px; border-left: 4px solid #f5c518; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .label { font-weight: bold; color: #666; }
            .value { color: #000; }
            .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎬 CINEBOOK</h1>
              <p>Your Booking is Confirmed!</p>
            </div>
            <div class="content">
              <p>Hi there,</p>
              <p>Thank you for booking with CINEBOOK! Your movie ticket has been successfully confirmed.</p>
              
              <div class="ticket">
                <h2 style="color: #f5c518; margin-top: 0;">🎟️ Booking Details</h2>
                <div class="detail-row">
                  <span class="label">Transaction ID:</span>
                  <span class="value"><strong>${transactionId}</strong></span>
                </div>
                <div class="detail-row">
                  <span class="label">Movie:</span>
                  <span class="value">${movieTitle}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Cinema:</span>
                  <span class="value">${cinema}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Show Time:</span>
                  <span class="value">${showTime}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Seats:</span>
                  <span class="value">${seats}</span>
                </div>
                <div class="detail-row" style="border-bottom: none;">
                  <span class="label">Total Amount:</span>
                  <span class="value" style="color: #f5c518; font-size: 18px;"><strong>$${totalPrice}</strong></span>
                </div>
              </div>

              <p><strong>Important:</strong> Please arrive at the cinema at least 15 minutes before the show time.</p>
              <p>Show this email or your transaction ID at the counter to collect your tickets.</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
              <p>&copy; 2026 CINEBOOK. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Booking confirmation sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending booking confirmation:", error.message);
    return false;
  }
};

// Send admin notification
const sendAdminNotification = async (bookingDetails) => {
  const {
    transactionId,
    userName,
    userEmail,
    movieTitle,
    cinema,
    seats,
    totalPrice,
    showTime,
  } = bookingDetails;

  const mailOptions = {
    from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `New Booking: ${transactionId}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #000; color: #f5c518; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; }
            .detail { background: white; padding: 15px; margin: 10px 0; border-left: 3px solid #f5c518; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🎬 New Booking Alert</h2>
            </div>
            <div class="content">
              <p><strong>A new booking has been made!</strong></p>
              <div class="detail">
                <p><strong>Transaction ID:</strong> ${transactionId}</p>
                <p><strong>Customer:</strong> ${userName} (${userEmail})</p>
                <p><strong>Movie:</strong> ${movieTitle}</p>
                <p><strong>Cinema:</strong> ${cinema}</p>
                <p><strong>Show Time:</strong> ${showTime}</p>
                <p><strong>Seats:</strong> ${seats}</p>
                <p><strong>Amount:</strong> <span style="color: #f5c518; font-size: 18px;">$${totalPrice}</span></p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Admin notification sent for booking ${transactionId}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending admin notification:", error.message);
    return false;
  }
};

module.exports = {
  sendBookingConfirmation,
  sendAdminNotification,
};
