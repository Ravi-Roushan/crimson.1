const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

// Parse JSON and urlencoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the root directory
app.use(express.static(__dirname, {
  setHeaders: function (res, filePath) {
    const ext = path.extname(filePath).toLowerCase();
    if (['.webp', '.avif', '.mp4', '.woff2', '.js', '.css'].includes(ext)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (ext === '.html') {
      res.setHeader('Cache-Control', 'public, max-age=300, must-revalidate');
    }
  }
}));

// Form Submission Endpoint
app.post('/api/submit-form', async (req, res) => {
  const { formType, fullname, phone, email, explore, message } = req.body;

  console.log(`[Form Submission] Type: ${formType}`);
  console.log(`Details: Name: ${fullname}, Phone: ${phone}, Email: ${email}`);
  if (explore) console.log(`Selected Options: ${JSON.stringify(explore)}`);
  if (message) console.log(`Message: ${message}`);

  const recipientEmail = 'akashjadhav32004@gmail.com';
  const senderEmail = process.env.EMAIL_USER || recipientEmail;
  const senderPass = process.env.EMAIL_PASS;

  // 1. Build Email Contents
  const isPrivatePreview = formType === 'private-preview';
  const formTitle = isPrivatePreview ? 'Private Preview Access Request' : 'New Client Inquiry';
  
  // Format selected options list if applicable
  const optionsHtml = (explore && Array.isArray(explore)) 
    ? `<ul>${explore.map(opt => `<li>${opt.replace(/-/g, ' ').toUpperCase()}</li>`).join('')}</ul>`
    : (explore ? `<ul><li>${explore.toUpperCase()}</li></ul>` : 'None selected');

  // Email to the Company (Notification)
  const companyMailOptions = {
    from: `"The Crimson Notifications" <${senderEmail}>`,
    to: recipientEmail,
    subject: `[ALERT] ${formTitle} - ${fullname}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #c9a96e; padding: 24px; border-radius: 8px; background-color: #fcfcfc;">
        <h2 style="color: #4A0707; border-bottom: 2px solid #c9a96e; padding-bottom: 12px; margin-top: 0;">${formTitle} Received</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 18px;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; width: 150px; color: #555;">Full Name:</td>
            <td style="padding: 8px 0; color: #222;">${fullname}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #555;">Contact Number:</td>
            <td style="padding: 8px 0; color: #222;">${phone}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #555;">Email ID:</td>
            <td style="padding: 8px 0; color: #222;">${email}</td>
          </tr>
          ${isPrivatePreview ? `
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #555; vertical-align: top;">Interests:</td>
            <td style="padding: 8px 0; color: #222;">${optionsHtml}</td>
          </tr>
          ` : `
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #555; vertical-align: top;">Message:</td>
            <td style="padding: 8px 0; color: #222; white-space: pre-wrap;">${message}</td>
          </tr>
          `}
        </table>
        <div style="margin-top: 24px; font-size: 11px; color: #888; text-align: center; border-top: 1px solid #eee; padding-top: 12px;">
          Submitted via The Crimson Landing Page form.
        </div>
      </div>
    `
  };

  // Thank You Email to the User
  const userMailOptions = {
    from: `"The Crimson Borivali" <${senderEmail}>`,
    to: email,
    subject: isPrivatePreview 
      ? `Thanks for booking a private preview - The Crimson` 
      : `Thank you for your inquiry - The Crimson`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid rgba(74, 7, 7, 0.1); border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="background-color: #4A0707; color: #F2E3D3; padding: 32px 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 300; letter-spacing: 2px;">THE CRIMSON</h1>
          <p style="margin: 5px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; color: #c9a96e;">Borivali West</p>
        </div>
        <div style="padding: 32px 24px; background-color: #ffffff; color: #333; line-height: 1.6;">
          <p style="font-size: 16px; margin-top: 0;">Dear <strong>${fullname}</strong>,</p>
          <p>${isPrivatePreview 
            ? 'Thank you for requesting private preview access to The Crimson, Borivali. We have received your request details successfully.' 
            : 'Thank you for reaching out to us. We have received your inquiry details successfully.'
          }</p>
          
          <div style="background-color: #FCF5E5; border-left: 3px solid #c9a96e; padding: 18px; margin: 24px 0; border-radius: 4px;">
            <h4 style="margin: 0 0 8px 0; color: #4A0707; font-size: 14px;">Your Request Details:</h4>
            <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #555;">
              <li><strong>Contact Number:</strong> ${phone}</li>
              ${isPrivatePreview ? `<li><strong>Interests:</strong> ${explore && Array.isArray(explore) ? explore.join(', ').replace(/-/g, ' ').toUpperCase() : explore || 'Virtual Tour'}</li>` : ''}
            </ul>
          </div>

          <p>${isPrivatePreview 
            ? 'Our dedicated relations team will connect with you shortly to curate your personalized Crimson experience and schedule your private walk-through.' 
            : 'Our dedicated relations team has received your message and will get back to you shortly to assist with your query.'
          }</p>
          <p style="margin-bottom: 0;">Warm regards,<br /><strong>The Crimson Relationship Team</strong></p>
        </div>
        <div style="background-color: #f7f3eb; padding: 18px 24px; text-align: center; font-size: 11px; color: #666; border-top: 1px solid #eee;">
          The Crimson Sales Lounge, S.V. Road, Borivali West, Mumbai 400092<br />
          &copy; 2026 IM Buildcon. All Rights Reserved.
        </div>
      </div>
    `
  };

  // 2. Transporter Config
  // If email pass is not provided, run in test mode (no credentials)
  if (!senderPass) {
    console.log('[WARNING] EMAIL_PASS environment variable is not configured. Simulating successful form submit.');
    return res.status(200).json({
      success: true,
      message: 'Form submitted successfully (Test Mode: email details logged in terminal).'
    });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: senderEmail,
      pass: senderPass
    }
  });

  try {
    // Send both emails in parallel
    await Promise.all([
      transporter.sendMail(companyMailOptions),
      transporter.sendMail(userMailOptions)
    ]);

    console.log('[SUCCESS] Notification and Thank-you emails sent successfully via Gmail.');
    res.status(200).json({
      success: true,
      message: 'Form submitted successfully. Confirmation email sent.'
    });
  } catch (error) {
    console.error('[ERROR] Failed to send emails:', error);
    // Return a soft success response to the frontend so users aren't blocked by credential issues
    res.status(200).json({
      success: true,
      message: 'Form details received successfully (SMTP server delivery failed).',
      error: error.message
    });
  }
});

// Fallback: serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Export the Express app for Vercel/serverless use.
// Keep the local npm start behavior unchanged.
module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`============================================================`);
    console.log(`   THE CRIMSON SERVER IS RUNNING ON PORT ${PORT}`);
    console.log(`   Local URL: http://localhost:${PORT}`);
    console.log(`============================================================`);
  });
}
