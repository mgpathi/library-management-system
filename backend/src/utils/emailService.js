/**
 * Email Service
 * Handles sending emails using Nodemailer
 */

import nodemailer from 'nodemailer';

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

/**
 * Send email
 * @param {String} to - Recipient email
 * @param {String} subject - Email subject
 * @param {String} html - Email HTML content
 * @returns {Promise}
 */
export const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    });

    console.log(`✓ Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`✗ Email send failed: ${error.message}`);
    throw error;
  }
};

/**
 * Send password reset email
 * @param {String} email - User email
 * @param {String} resetUrl - Password reset URL
 */
export const sendPasswordResetEmail = async (email, resetUrl) => {
  const html = `
    <h2>Password Reset Request</h2>
    <p>You requested a password reset. Click the link below to reset your password:</p>
    <a href="${resetUrl}">Reset Password</a>
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `;

  return sendEmail(email, 'Password Reset Request', html);
};

/**
 * Send welcome email
 * @param {String} email - User email
 * @param {String} fullName - User full name
 */
export const sendWelcomeEmail = async (email, fullName) => {
  const html = `
    <h2>Welcome to Library Management System!</h2>
    <p>Hi ${fullName},</p>
    <p>Welcome to our library system. Your account has been created successfully.</p>
    <p>You can now login and start exploring our library collection.</p>
    <p>Happy reading!</p>
  `;

  return sendEmail(email, 'Welcome to Library Management System', html);
};

/**
 * Send overdue book reminder email
 * @param {String} email - User email
 * @param {Object} books - Array of overdue books
 */
export const sendOverdueReminderEmail = async (email, books) => {
  const bookList = books.map(b => `<li>${b.title} by ${b.author} - Due: ${b.dueDate}</li>`).join('');

  const html = `
    <h2>Overdue Book Reminder</h2>
    <p>You have overdue books in your account:</p>
    <ul>${bookList}</ul>
    <p>Please return them as soon as possible to avoid fines.</p>
  `;

  return sendEmail(email, 'Overdue Book Reminder', html);
};

/**
 * Send fine notification email
 * @param {String} email - User email
 * @param {Number} amount - Fine amount
 * @param {String} bookTitle - Book title
 */
export const sendFineNotificationEmail = async (email, amount, bookTitle) => {
  const html = `
    <h2>Fine Notification</h2>
    <p>A fine has been generated for the overdue book:</p>
    <p><strong>Book:</strong> ${bookTitle}</p>
    <p><strong>Fine Amount:</strong> Rs. ${amount}</p>
    <p>Please make the payment at your earliest convenience.</p>
  `;

  return sendEmail(email, 'Fine Notification', html);
};

export default {
  sendEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendOverdueReminderEmail,
  sendFineNotificationEmail,
};
