require('dotenv').config();
const twilio = require('twilio');
const SibApiV3Sdk = require('sib-api-v3-sdk');
const { buildBookingEmailHTML } = require('./emailTemplates');

/* ═══════════════════════════════════════
   BREVO EMAIL CLIENT (lazy init)
   ═══════════════════════════════════════ */
let brevoApiInstance = null;

function getBrevoApi() {
  if (!brevoApiInstance && process.env.BREVO_API_KEY) {
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    defaultClient.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;
    brevoApiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  }
  return brevoApiInstance;
}

/* ═══════════════════════════════════════
   TWILIO WHATSAPP CLIENT (lazy init)
   ═══════════════════════════════════════ */
let twilioClient = null;

function getTwilioClient() {
  if (!twilioClient && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return twilioClient;
}

/* ═══════════════════════════════════════
   FORMAT HELPERS
   ═══════════════════════════════════════ */
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatCurrency(n) {
  if (n == null) return '—';
  return '₹ ' + Number(n).toLocaleString('en-IN');
}

/* ═══════════════════════════════════════
   BUILD WHATSAPP MESSAGE — USER
   ═══════════════════════════════════════ */
function buildWhatsAppMessage(booking) {
  const tripType = booking.notes ? booking.notes.split('|').find(n => n.includes('Trip Type'))?.trim() : '';
  const journeyTime = booking.notes ? booking.notes.split('|').find(n => n.includes('Time'))?.trim() : '';
  const distance = booking.notes ? booking.notes.split('|').find(n => n.includes('Distance'))?.trim() : '';
  const duration = booking.notes ? booking.notes.split('|').find(n => n.includes('Duration'))?.trim() : '';
  const luggage = booking.notes ? booking.notes.split('|').find(n => n.includes('Luggage'))?.trim() : '';

  const vehicleName = booking.vehicleId?.name || 'N/A';
  const vehicleModel = booking.vehicleId?.model || booking.vehicleId?.type || '';
  const vehicleSeats = booking.vehicleId?.seats || 'N/A';

  let msg = `🚗 *VOYAGO BOOKING CONFIRMED*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  msg += `📋 *Booking ID*\n${booking.bookingId}\n\n`;
  msg += `📍 *Route*\n${booking.pickupLocation} → ${booking.dropoffLocation}\n\n`;
  msg += `📅 *Date & Time*\n${formatDate(booking.pickupDate)}${journeyTime ? ' at ' + journeyTime.replace('Time:', '').trim() : ''}\n\n`;
  if (tripType) msg += `🔄 *${tripType.trim()}*\n\n`;
  if (booking.returnDate) msg += `📅 *Return Date*\n${formatDate(booking.returnDate)}\n\n`;
  if (distance) msg += `📏 *${distance.trim()}*\n`;
  if (duration) msg += `⏱ *${duration.trim()}*\n\n`;
  msg += `🚐 *Vehicle*\n${vehicleName}${vehicleModel ? ' — ' + vehicleModel : ''}\n`;
  msg += `${vehicleSeats} Seats\n\n`;
  msg += `👥 *Passengers*: ${booking.numberOfPeople}\n`;
  if (luggage) msg += `🧳 *${luggage.trim()}*\n\n`;
  msg += `💰 *Total Fare*\n${formatCurrency(booking.totalPrice)}\n\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `Thank you for choosing Voyago! 🙏\n`;
  msg += `Our team will contact you shortly.`;

  return msg;
}

/* ═══════════════════════════════════════
   BUILD WHATSAPP MESSAGE — ADMIN
   ═══════════════════════════════════════ */
function buildAdminWhatsAppMessage(booking) {
  const vehicleName = booking.vehicleId?.name || 'N/A';
  const tripType = booking.notes ? booking.notes.split('|').find(n => n.includes('Trip Type'))?.trim() : '';

  let msg = `📋 *NEW BOOKING — VOYAGO*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  msg += `ID: ${booking.bookingId}\n`;
  msg += `Customer: ${booking.name}\n`;
  msg += `Phone: ${booking.phone}\n`;
  msg += `Email: ${booking.email}\n\n`;
  msg += `Route: ${booking.pickupLocation} → ${booking.dropoffLocation}\n`;
  msg += `Date: ${formatDate(booking.pickupDate)}\n`;
  if (tripType) msg += `Type: ${tripType.trim()}\n`;
  if (booking.returnDate) msg += `Return: ${formatDate(booking.returnDate)}\n`;
  msg += `Vehicle: ${vehicleName}\n`;
  msg += `Passengers: ${booking.numberOfPeople}\n`;
  msg += `Fare: ${formatCurrency(booking.totalPrice)}\n\n`;
  msg += `Status: ${booking.status.toUpperCase()}`;

  return msg;
}

/* ═══════════════════════════════════════
   SEND WHATSAPP TO USER
   ═══════════════════════════════════════ */
async function sendUserWhatsApp(booking) {
  const client = getTwilioClient();
  if (!client || !process.env.TWILIO_WHATSAPP_FROM) {
    console.log('⏭  Skipping user WhatsApp — Twilio not configured');
    return;
  }

  let toPhone = booking.phone;
  if (!toPhone.startsWith('+')) toPhone = '+91' + toPhone.replace(/\D/g, '');

  try {
    const msg = buildWhatsAppMessage(booking);
    await client.messages.create({
      body: msg,
      from: 'whatsapp:' + process.env.TWILIO_WHATSAPP_FROM,
      to: 'whatsapp:' + toPhone
    });
    console.log(`✅ WhatsApp sent to user: ${toPhone}`);
  } catch (err) {
    console.error('❌ User WhatsApp failed:', err.message);
  }
}

/* ═══════════════════════════════════════
   SEND WHATSAPP TO ADMIN
   ═══════════════════════════════════════ */
async function sendAdminWhatsApp(booking) {
  const client = getTwilioClient();
  if (!client || !process.env.TWILIO_WHATSAPP_FROM || !process.env.ADMIN_WHATSAPP) {
    console.log('⏭  Skipping admin WhatsApp — Twilio/Admin not configured');
    return;
  }

  let toPhone = process.env.ADMIN_WHATSAPP;
  if (!toPhone.startsWith('+')) toPhone = '+91' + toPhone.replace(/\D/g, '');

  try {
    const msg = buildAdminWhatsAppMessage(booking);
    await client.messages.create({
      body: msg,
      from: 'whatsapp:' + process.env.TWILIO_WHATSAPP_FROM,
      to: 'whatsapp:' + toPhone
    });
    console.log(`✅ WhatsApp sent to admin: ${toPhone}`);
  } catch (err) {
    console.error('❌ Admin WhatsApp failed:', err.message);
  }
}

/* ═══════════════════════════════════════
   SEND EMAIL TO USER VIA BREVO
   ═══════════════════════════════════════ */
async function sendUserEmail(booking) {
  const api = getBrevoApi();
  if (!api) {
    console.log('⏭  Skipping user email — Brevo not configured');
    return;
  }

  try {
    const htmlContent = buildBookingEmailHTML(booking);

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.sender = {
      name: process.env.SENDER_NAME || 'Voyago Tours & Travels',
      email: process.env.SENDER_EMAIL
    };
    sendSmtpEmail.to = [{ email: booking.email, name: booking.name }];
    if (process.env.REPLY_TO) {
      sendSmtpEmail.replyTo = { email: process.env.REPLY_TO };
    }
    sendSmtpEmail.subject = `Booking Confirmed — ${booking.bookingId} | Voyago Tours & Travels`;
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.headers = {
      'X-Mailin-custom': 'voyago-booking-confirmation'
    };

    const result = await api.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ Brevo email sent to: ${booking.email} (messageId: ${result.messageId})`);
  } catch (err) {
    console.error('❌ Brevo email failed:', err.message);
    if (err.responseBody) {
      console.error('   Brevo error details:', JSON.stringify(err.responseBody, null, 2));
    }
  }
}

/* ═══════════════════════════════════════
   MASTER: SEND ALL NOTIFICATIONS
   Runs all 3 in parallel — none block each other.
   ═══════════════════════════════════════ */
async function sendAllNotifications(booking) {
  await Promise.allSettled([
    sendUserWhatsApp(booking),
    sendAdminWhatsApp(booking),
    sendUserEmail(booking)
  ]);
  console.log(`📨 Notification batch completed for ${booking.bookingId}`);
}

module.exports = {
  sendUserWhatsApp,
  sendAdminWhatsApp,
  sendUserEmail,
  sendAllNotifications
};