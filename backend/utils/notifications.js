require('dotenv').config();
const twilio = require('twilio');
const SibApiV3Sdk = require('sib-api-v3-sdk');
const { buildBookingEmailHTML } = require('./emailTemplates');

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function formatCurrency(n) {
  if (n == null) return '—';
  return '₹ ' + Number(n).toLocaleString('en-IN');
}

function parseNotes(notes) {
  if (!notes) return {};
  const parts = notes.split('|').map(s => s.trim());
  const result = {};
  for (const p of parts) {
    const idx = p.indexOf(':');
    if (idx > -1) {
      const key = p.substring(0, idx).trim();
      const val = p.substring(idx + 1).trim();
      result[key] = val;
    }
  }
  return result;
}

function normalizeIndianPhone(phone) {
  if (!phone) return null;
  let cleaned = String(phone).replace(/\D/g, '');
  if (cleaned.length === 10) cleaned = '91' + cleaned;
  if (!cleaned.startsWith('91') && cleaned.length === 12) {
    // keep as-is if already has country code other than 91
  }
  return '+' + cleaned;
}

/* ═══════════════════════════════════════════════════════════════
   BREVO INIT
═══════════════════════════════════════════════════════════════ */
let brevoApi = null;

function getBrevoApi() {
  if (!process.env.BREVO_API_KEY) {
    console.warn('⚠ BREVO_API_KEY missing in .env');
    return null;
  }

  if (!brevoApi) {
    const client = SibApiV3Sdk.ApiClient.instance;
    client.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;
    brevoApi = new SibApiV3Sdk.TransactionalEmailsApi();
    console.log('✅ Brevo API initialized successfully');
  }

  return brevoApi;
}

/* ═══════════════════════════════════════════════════════════════
   TWILIO INIT
═══════════════════════════════════════════════════════════════ */
let twilioClient = null;

function getTwilioClient() {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.warn('⚠ Twilio credentials missing in .env');
    return null;
  }

  if (!twilioClient) {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    console.log('✅ Twilio client initialized successfully');
  }

  return twilioClient;
}

/* ═══════════════════════════════════════════════════════════════
   WHATSAPP MESSAGE — USER
═══════════════════════════════════════════════════════════════ */
function buildWhatsAppMessage(booking) {
  const notes = parseNotes(booking.notes);
  const tripType = notes['Trip Type'] || booking.bookingType || '—';
  const journeyTime = notes['Time'] || '—';
  const distance = notes['Distance'] || '—';
  const duration = notes['Duration'] || '—';
  const luggage = notes['Luggage'] || '—';

  const vehicleName = booking.vehicleId?.name || 'N/A';
  const vehicleModel = booking.vehicleId?.model || booking.vehicleId?.type || '';
  const vehicleSeats = booking.vehicleId?.seats || 'N/A';

  let msg = `🚗 *VOYAGO BOOKING CONFIRMED*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  msg += `📋 *Booking ID*\n${booking.bookingId}\n\n`;
  msg += `📍 *Route*\n${booking.pickupLocation} → ${booking.dropoffLocation}\n\n`;
  msg += `📅 *Date & Time*\n${formatDate(booking.pickupDate)} at ${journeyTime}\n\n`;
  msg += `🔄 *Trip Type*\n${tripType}\n\n`;

  if (booking.returnDate) {
    msg += `📅 *Return Date*\n${formatDate(booking.returnDate)}\n\n`;
  }

  msg += `📏 *Distance*: ${distance}\n`;
  msg += `⏱ *Duration*: ${duration}\n\n`;
  msg += `🚐 *Vehicle*\n${vehicleName}${vehicleModel ? ' — ' + vehicleModel : ''}\n`;
  msg += `${vehicleSeats} Seats\n\n`;
  msg += `👥 *Passengers*: ${booking.numberOfPeople || '—'}\n`;
  msg += `🧳 *Luggage*: ${luggage}\n\n`;
  msg += `💰 *Total Fare*\n${formatCurrency(booking.totalPrice)}\n\n`;
  msg += `Thank you for choosing Voyago! 🙏\n`;
  msg += `Our team will contact you shortly.`;

  return msg;
}

/* ═══════════════════════════════════════════════════════════════
   WHATSAPP MESSAGE — ADMIN
═══════════════════════════════════════════════════════════════ */
function buildAdminWhatsAppMessage(booking) {
  const notes = parseNotes(booking.notes);
  const tripType = notes['Trip Type'] || booking.bookingType || '—';
  const vehicleName = booking.vehicleId?.name || 'N/A';

  let msg = `📋 *NEW BOOKING — VOYAGO*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  msg += `ID: ${booking.bookingId}\n`;
  msg += `Customer: ${booking.name}\n`;
  msg += `Phone: ${booking.phone}\n`;
  msg += `Email: ${booking.email}\n\n`;
  msg += `Route: ${booking.pickupLocation} → ${booking.dropoffLocation}\n`;
  msg += `Date: ${formatDate(booking.pickupDate)}\n`;
  msg += `Type: ${tripType}\n`;
  if (booking.returnDate) msg += `Return: ${formatDate(booking.returnDate)}\n`;
  msg += `Vehicle: ${vehicleName}\n`;
  msg += `Passengers: ${booking.numberOfPeople}\n`;
  msg += `Fare: ${formatCurrency(booking.totalPrice)}\n`;
  msg += `Status: ${(booking.status || 'pending').toUpperCase()}`;

  return msg;
}

/* ═══════════════════════════════════════════════════════════════
   SEND USER WHATSAPP
═══════════════════════════════════════════════════════════════ */
async function sendUserWhatsApp(booking) {
  try {
    const client = getTwilioClient();

    if (!client) {
      return { success: false, skipped: true, reason: 'Twilio not configured' };
    }

    if (!process.env.TWILIO_WHATSAPP_FROM) {
      return { success: false, skipped: true, reason: 'TWILIO_WHATSAPP_FROM missing' };
    }

    const toPhone = normalizeIndianPhone(booking.phone);
    if (!toPhone) {
      return { success: false, skipped: true, reason: 'Invalid customer phone' };
    }

    const msg = buildWhatsAppMessage(booking);

    const result = await client.messages.create({
      body: msg,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
      to: `whatsapp:${toPhone}`
    });

    console.log(`✅ WhatsApp sent to user: ${toPhone} (SID: ${result.sid})`);
    return { success: true, sid: result.sid };
  } catch (err) {
    console.error('❌ User WhatsApp failed:', err.message);
    return { success: false, error: err.message };
  }
}

/* ═══════════════════════════════════════════════════════════════
   SEND ADMIN WHATSAPP
═══════════════════════════════════════════════════════════════ */
async function sendAdminWhatsApp(booking) {
  try {
    const client = getTwilioClient();

    if (!client) {
      return { success: false, skipped: true, reason: 'Twilio not configured' };
    }

    if (!process.env.TWILIO_WHATSAPP_FROM) {
      return { success: false, skipped: true, reason: 'TWILIO_WHATSAPP_FROM missing' };
    }

    if (!process.env.ADMIN_WHATSAPP) {
      return { success: false, skipped: true, reason: 'ADMIN_WHATSAPP missing' };
    }

    const toPhone = normalizeIndianPhone(process.env.ADMIN_WHATSAPP);
    if (!toPhone) {
      return { success: false, skipped: true, reason: 'Invalid admin phone' };
    }

    const msg = buildAdminWhatsAppMessage(booking);

    const result = await client.messages.create({
      body: msg,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
      to: `whatsapp:${toPhone}`
    });

    console.log(`✅ WhatsApp sent to admin: ${toPhone} (SID: ${result.sid})`);
    return { success: true, sid: result.sid };
  } catch (err) {
    console.error('❌ Admin WhatsApp failed:', err.message);
    return { success: false, error: err.message };
  }
}

/* ═══════════════════════════════════════════════════════════════
   SEND USER EMAIL
═══════════════════════════════════════════════════════════════ */
async function sendUserEmail(booking) {
  try {
    const api = getBrevoApi();

    if (!api) {
      return { success: false, skipped: true, reason: 'Brevo not configured' };
    }

    if (!process.env.SENDER_EMAIL) {
      return { success: false, skipped: true, reason: 'SENDER_EMAIL missing' };
    }

    if (!booking.email) {
      return { success: false, skipped: true, reason: 'Customer email missing' };
    }

    const htmlContent = buildBookingEmailHTML(booking);

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.sender = {
      name: process.env.SENDER_NAME || 'Voyago Tours & Travels',
      email: process.env.SENDER_EMAIL
    };
    sendSmtpEmail.to = [{ email: booking.email, name: booking.name || 'Customer' }];
    sendSmtpEmail.subject = `Booking Confirmed — ${booking.bookingId} | Voyago Tours & Travels`;
    sendSmtpEmail.htmlContent = htmlContent;

    if (process.env.REPLY_TO) {
      sendSmtpEmail.replyTo = { email: process.env.REPLY_TO };
    }

    const result = await api.sendTransacEmail(sendSmtpEmail);

    console.log(`✅ Brevo email sent to: ${booking.email} (messageId: ${result.messageId || 'N/A'})`);
    return { success: true, messageId: result.messageId || null };
  } catch (err) {
    console.error('❌ Brevo email failed:', err.message);
    if (err.response?.body) {
      console.error('Brevo response:', err.response.body);
    }
    if (err.responseBody) {
      console.error('Brevo responseBody:', err.responseBody);
    }
    return {
      success: false,
      error: err.message,
      details: err.responseBody || err.response?.body || null
    };
  }
}

/* ═══════════════════════════════════════════════════════════════
   SEND ALL NOTIFICATIONS
═══════════════════════════════════════════════════════════════ */
async function sendAllNotifications(booking) {
  console.log('📨 ════════════════════════════════════════════════════════════════');
  console.log('📨 STARTING NOTIFICATION BATCH FOR BOOKING');
  console.log('📨 ════════════════════════════════════════════════════════════════');
  console.log(`📨 Booking ID: ${booking.bookingId}`);
  console.log(`📨 Customer: ${booking.name}`);
  console.log(`📨 Email: ${booking.email}`);
  console.log(`📨 Phone: ${booking.phone}`);
  console.log(`📨 Type: ${booking.bookingType}`);
  console.log(`📨 Status: ${booking.status}`);
  console.log('📨 ════════════════════════════════════════════════════════════════');

  const [userWa, adminWa, userMail] = await Promise.all([
    sendUserWhatsApp(booking),
    sendAdminWhatsApp(booking),
    sendUserEmail(booking)
  ]);

  if (userWa.success) {
    console.log('✅ User WhatsApp: Success');
  } else if (userWa.skipped) {
    console.log(`⏭  User WhatsApp: Skipped - ${userWa.reason}`);
  } else {
    console.log(`❌ User WhatsApp: Failed - ${userWa.error}`);
  }

  if (adminWa.success) {
    console.log('✅ Admin WhatsApp: Success');
  } else if (adminWa.skipped) {
    console.log(`⏭  Admin WhatsApp: Skipped - ${adminWa.reason}`);
  } else {
    console.log(`❌ Admin WhatsApp: Failed - ${adminWa.error}`);
  }

  if (userMail.success) {
    console.log('✅ User Email: Success');
  } else if (userMail.skipped) {
    console.log(`⏭  User Email: Skipped - ${userMail.reason}`);
  } else {
    console.log(`❌ User Email: Failed - ${userMail.error}`);
  }

  console.log('📨 ════════════════════════════════════════════════════════════════');
  console.log(`📨 NOTIFICATION BATCH COMPLETED FOR ${booking.bookingId}`);
  console.log('📨 ════════════════════════════════════════════════════════════════');

  return {
    success: userWa.success || adminWa.success || userMail.success,
    results: {
      userWhatsApp: userWa,
      adminWhatsApp: adminWa,
      userEmail: userMail
    }
  };
}

module.exports = {
  sendUserWhatsApp,
  sendAdminWhatsApp,
  sendUserEmail,
  sendAllNotifications
};