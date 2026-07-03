require('dotenv').config();
const twilio = require('twilio');
const SibApiV3Sdk = require('sib-api-v3-sdk');
const { buildBookingEmailHTML, buildStatusUpdateEmailHTML } = require('./emailTemplates');

/* ═══════════════════════════════════════
   BREVO EMAIL CLIENT (lazy init)
   ═══════════════════════════════════════ */
let brevoApiInstance = null;
let brevoInitError = null;

function getBrevoApi() {
  if (brevoInitError) return null;
  if (!brevoApiInstance) {
    try {
      if (!process.env.BREVO_API_KEY) {
        console.log('⏭  Brevo: No BREVO_API_KEY in .env');
        brevoInitError = 'No API key';
        return null;
      }
      if (!process.env.BREVO_API_KEY.startsWith('xkeysib-')) {
        console.error('❌ Brevo: API key must start with "xkeysib-". You have: ' + process.env.BREVO_API_KEY.substring(0, 12) + '...');
        console.error('   Go to Brevo Dashboard → SMTP & API → Create new API key (not SMTP key)');
        brevoInitError = 'Wrong key format';
        return null;
      }
      const defaultClient = SibApiV3Sdk.ApiClient.instance;
      defaultClient.basePath = 'https://api.brevo.com/v3';
      defaultClient.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;
      brevoApiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
      console.log('✅ Brevo API client initialized successfully');
    } catch (err) {
      console.error('❌ Brevo init failed:', err.message);
      brevoInitError = err.message;
      return null;
    }
  }
  return brevoApiInstance;
}

/* ═══════════════════════════════════════
   TWILIO WHATSAPP CLIENT (lazy init)
   ═══════════════════════════════════════ */
let twilioClient = null;

function getTwilioClient() {
  if (!twilioClient && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
      twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      console.log('✅ Twilio client initialized');
    } catch (err) {
      console.error('❌ Twilio init failed:', err.message);
    }
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

function parseNotes(notes) {
  if (!notes) return {};
  const parts = notes.split('|').map(s => s.trim());
  const result = {};
  parts.forEach(p => {
    const colonIdx = p.indexOf(':');
    if (colonIdx > -1) {
      const key = p.substring(0, colonIdx).trim();
      const val = p.substring(colonIdx + 1).trim();
      result[key] = val;
    }
  });
  return result;
}

/* ═══════════════════════════════════════
   WHATSAPP MESSAGE BUILDERS
   ═══════════════════════════════════════ */
function buildWhatsAppMessage(booking) {
  const noteData = parseNotes(booking.notes);
  const tripType = noteData['Trip Type'] || '—';
  const journeyTime = noteData['Time'] || '';
  const distance = noteData['Distance'] || '';
  const duration = noteData['Duration'] || '';
  const luggage = noteData['Luggage'] || '';
  const vehicleName = booking.vehicleId?.name || 'N/A';
  const vehicleModel = booking.vehicleId?.model || booking.vehicleId?.type || '';
  const vehicleSeats = booking.vehicleId?.seats || 'N/A';
  const packageName = booking.packageId?.title || booking.packageId?.name || '';
  const isPackage = booking.bookingType === 'package';

  let msg = `🚗 *AMAN TOUR AND TRAVELS*\n`;
  msg += `SAFE JOURNEY, HAPPY JOURNEY\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  msg += `📋 *Booking ID*\n${booking.bookingId}\n\n`;

  if (isPackage && packageName) {
    msg += `🎒 *Package*\n${packageName}\n\n`;
    msg += `📅 *Travel Date*\n${formatDate(booking.pickupDate)}\n\n`;
    msg += `👥 *Travelers*: ${booking.numberOfPeople || 1}\n\n`;
  } else {
    msg += `📍 *Route*\n${booking.pickupLocation || 'N/A'} → ${booking.dropoffLocation || 'N/A'}\n\n`;
    msg += `📅 *Date & Time*\n${formatDate(booking.pickupDate)}${journeyTime ? ' at ' + journeyTime.replace('Time:', '').trim() : ''}\n\n`;
    if (tripType && tripType !== '—') msg += `🔄 *${tripType}*\n\n`;
    if (booking.returnDate) msg += `📅 *Return Date*\n${formatDate(booking.returnDate)}\n\n`;
    if (distance) msg += `📏 *${distance}*\n`;
    if (duration) msg += `⏱ *${duration}*\n\n`;
    msg += `🚐 *Vehicle*\n${vehicleName}${vehicleModel ? ' — ' + vehicleModel : ''}\n`;
    msg += `${vehicleSeats} Seats\n\n`;
    msg += `👥 *Passengers*: ${booking.numberOfPeople || 1}\n`;
    if (luggage) msg += `🧳 *${luggage}*\n\n`;
  }

  msg += `💰 *Total Fare*\n${formatCurrency(booking.totalPrice)}\n\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `Thank you for choosing Aman Tour and Travels! 🙏\n`;
  msg += `Our team will contact you shortly.`;

  return msg;
}

function buildAdminWhatsAppMessage(booking) {
  const vehicleName = booking.vehicleId?.name || 'N/A';
  const packageName = booking.packageId?.title || booking.packageId?.name || '';
  const noteData = parseNotes(booking.notes);
  const tripType = noteData['Trip Type'] || '';
  const isPackage = booking.bookingType === 'package';

  let msg = `📋 *NEW BOOKING — AMAN TOUR AND TRAVELS*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  msg += `ID: ${booking.bookingId}\n`;
  msg += `Type: ${isPackage ? 'PACKAGE' : 'RIDE'}\n`;
  msg += `Customer: ${booking.name}\n`;
  msg += `Phone: ${booking.phone}\n`;
  msg += `Email: ${booking.email}\n\n`;

  if (isPackage && packageName) {
    msg += `Package: ${packageName}\n`;
    msg += `Travelers: ${booking.numberOfPeople || 1}\n`;
  } else {
    msg += `Route: ${booking.pickupLocation || 'N/A'} → ${booking.dropoffLocation || 'N/A'}\n`;
    if (tripType) msg += `Type: ${tripType}\n`;
    msg += `Vehicle: ${vehicleName}\n`;
    msg += `Passengers: ${booking.numberOfPeople || 1}\n`;
  }

  msg += `Date: ${formatDate(booking.pickupDate)}\n`;
  msg += `Fare: ${formatCurrency(booking.totalPrice)}\n\n`;
  msg += `Status: ${(booking.status || 'pending').toUpperCase()}`;
  return msg;
}

function buildStatusUpdateWhatsAppMessage(booking) {
  const status = booking.status || 'pending';
  const statusEmojis = {
    'confirmed': '✅', 'in-progress': '🚗', 'completed': '🎉',
    'cancelled': '❌', 'pending': '⏳'
  };
  const emoji = statusEmojis[status] || '📢';
  let msg = `${emoji} *AMAN TOUR AND TRAVELS — BOOKING UPDATE*\n━━━━━━━━━━━━━━━━━━━━\n\n`;
  msg += `📋 *Booking ID*\n${booking.bookingId}\n\n`;
  msg += `📊 *Status*: ${status.toUpperCase()}\n\n`;
  if (status === 'cancelled' && booking.cancelReason) msg += `📝 *Reason*: ${booking.cancelReason}\n\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  if (status === 'confirmed') msg += `Your ride has been confirmed! Driver details coming soon.`;
  else if (status === 'cancelled') msg += `Booking cancelled. Contact +91 1800-000-0000 for queries.`;
  else if (status === 'completed') msg += `Trip complete! Thank you for choosing Aman Tour and Travels! 🙏`;
  else if (status === 'in-progress') msg += `Your ride is in progress. Safe journey!`;
  else msg += `Your booking is being reviewed.`;
  return msg;
}

/* ═══════════════════════════════════════
   SEND WHATSAPP TO USER
   ═══════════════════════════════════════ */
async function sendUserWhatsApp(booking, isStatusUpdate = false) {
  const client = getTwilioClient();
  if (!client || !process.env.TWILIO_WHATSAPP_FROM) {
    console.log('⏭  User WhatsApp skipped — Twilio not configured');
    return { success: false, reason: 'Twilio not configured' };
  }
  if (!booking.phone) {
    console.log('⏭  User WhatsApp skipped — No phone number');
    return { success: false, reason: 'No phone' };
  }

  let toPhone = booking.phone.toString().trim();
  if (!toPhone.startsWith('+')) toPhone = '+91' + toPhone.replace(/\D/g, '');

  try {
    const msg = isStatusUpdate ? buildStatusUpdateWhatsAppMessage(booking) : buildWhatsAppMessage(booking);
    const result = await client.messages.create({
      body: msg,
      from: 'whatsapp:' + process.env.TWILIO_WHATSAPP_FROM,
      to: 'whatsapp:' + toPhone
    });
    console.log(`✅ WhatsApp sent to user: ${toPhone} (SID: ${result.sid})`);
    return { success: true, sid: result.sid };
  } catch (err) {
    console.error('❌ User WhatsApp failed:', err.message);
    if (err.code === 21211) console.error('   → Invalid phone number format');
    if (err.code === 21610) console.error('   → Recipient has not opted in to WhatsApp sandbox.');
    return { success: false, error: err.message, code: err.code };
  }
}

/* ═══════════════════════════════════════
   SEND WHATSAPP TO ADMIN
   ═══════════════════════════════════════ */
async function sendAdminWhatsApp(booking) {
  const client = getTwilioClient();
  if (!client || !process.env.TWILIO_WHATSAPP_FROM) {
    console.log('⏭  Admin WhatsApp skipped — Twilio not configured');
    return { success: false, reason: 'Twilio not configured' };
  }
  if (!process.env.ADMIN_WHATSAPP) {
    console.log('⏭  Admin WhatsApp skipped — ADMIN_WHATSAPP not set');
    return { success: false, reason: 'ADMIN_WHATSAPP not set' };
  }

  let toPhone = process.env.ADMIN_WHATSAPP.trim();
  if (!toPhone.startsWith('+')) toPhone = '+91' + toPhone.replace(/\D/g, '');

  try {
    const msg = buildAdminWhatsAppMessage(booking);
    const result = await client.messages.create({
      body: msg,
      from: 'whatsapp:' + process.env.TWILIO_WHATSAPP_FROM,
      to: 'whatsapp:' + toPhone
    });
    console.log(`✅ WhatsApp sent to admin: ${toPhone} (SID: ${result.sid})`);
    return { success: true, sid: result.sid };
  } catch (err) {
    console.error('❌ Admin WhatsApp failed:', err.message);
    return { success: false, error: err.message };
  }
}

/* ═══════════════════════════════════════
   SEND EMAIL TO USER VIA BREVO
   ═══════════════════════════════════════ */
async function sendUserEmail(booking, isStatusUpdate = false) {
  const api = getBrevoApi();
  if (!api) {
    console.log(`⏭  User email skipped — Brevo not ready (${brevoInitError || 'unknown'})`);
    return { success: false, reason: brevoInitError || 'Brevo not configured' };
  }
  if (!booking.email) {
    console.log('⏭  User email skipped — No email address');
    return { success: false, reason: 'No email' };
  }

  try {
    const htmlContent = isStatusUpdate
      ? buildStatusUpdateEmailHTML(booking)
      : buildBookingEmailHTML(booking);

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.sender = {
      name: process.env.SENDER_NAME || 'Aman Tour and Travels',
      email: process.env.SENDER_EMAIL
    };
    sendSmtpEmail.to = [{ email: booking.email, name: booking.name || 'Customer' }];
    if (process.env.REPLY_TO) {
      sendSmtpEmail.replyTo = { email: process.env.REPLY_TO };
    }

    const status = booking.status || 'confirmed';
    if (isStatusUpdate) {
      const subjectMap = {
        'confirmed': `Ride Confirmed — ${booking.bookingId} | Aman Tour and Travels`,
        'in-progress': `Ride In Progress — ${booking.bookingId} | Aman Tour and Travels`,
        'completed': `Trip Completed — ${booking.bookingId} | Aman Tour and Travels`,
        'cancelled': `Booking Cancelled — ${booking.bookingId} | Aman Tour and Travels`,
        'pending': `Booking Received — ${booking.bookingId} | Aman Tour and Travels`
      };
      sendSmtpEmail.subject = subjectMap[status] || `Booking Update — ${booking.bookingId} | Aman Tour and Travels`;
    } else {
      sendSmtpEmail.subject = `Booking Confirmed — ${booking.bookingId} | Aman Tour and Travels`;
    }

    sendSmtpEmail.htmlContent = htmlContent;

    const result = await api.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ Brevo email sent to: ${booking.email} (messageId: ${result.messageId})`);
    return { success: true, messageId: result.messageId };
  } catch (err) {
    console.error('❌ Brevo email failed:', err.message);
    if (err.responseBody) {
      const details = typeof err.responseBody === 'string'
        ? err.responseBody
        : JSON.stringify(err.responseBody, null, 2);
      console.error('   Brevo response:', details);
    }
    if (err.status === 401) console.error('   → API key is invalid or wrong format (need xkeysib-, not xsmtpsib-)');
    if (err.status === 403) console.error('   → Sender email not verified in Brevo. Add it in Settings → Senders');
    return { success: false, error: err.message, status: err.status };
  }
}

/* ═══════════════════════════════════════
   MASTER: SEND ALL NOTIFICATIONS (New Booking)
   ═══════════════════════════════════════ */
async function sendAllNotifications(booking) {
  console.log(`\n📨 ═══ NOTIFICATION BATCH ═══`);
  console.log(`   Booking: ${booking.bookingId}`);
  console.log(`   Email: ${booking.email || 'N/A'}`);
  console.log(`   Phone: ${booking.phone || 'N/A'}`);
  console.log(`   Type: ${booking.bookingType || 'ride'}`);
  console.log(`═══════════════════════════\n`);

  const results = await Promise.allSettled([
    sendUserWhatsApp(booking, false),
    sendAdminWhatsApp(booking),
    sendUserEmail(booking, false)
  ]);

  const labels = ['User WhatsApp', 'Admin WhatsApp', 'User Email'];
  let allSuccess = true;
  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      const r = result.value;
      if (r.success) {
        console.log(`   ✅ ${labels[i]}: Sent`);
      } else {
        console.log(`   ⏭  ${labels[i]}: ${r.reason || r.error || 'Skipped'}`);
        allSuccess = false;
      }
    } else {
      console.error(`   ❌ ${labels[i]}: ${result.reason?.message || 'Crashed'}`);
      allSuccess = false;
    }
  });

  console.log(`\n📨 Batch complete for ${booking.bookingId}\n`);
  return allSuccess;
}

/* ═══════════════════════════════════════
   SEND STATUS UPDATE NOTIFICATIONS
   ═══════════════════════════════════════ */
async function sendStatusUpdateNotifications(booking) {
  console.log(`\n📨 STATUS UPDATE: ${booking.bookingId} → ${booking.status}\n`);

  const results = await Promise.allSettled([
    sendUserWhatsApp(booking, true),
    sendAdminWhatsApp(booking),
    sendUserEmail(booking, true)
  ]);

  const labels = ['User WhatsApp', 'Admin WhatsApp', 'User Email'];
  results.forEach((result, i) => {
    if (result.status === 'fulfilled' && result.value.success) {
      console.log(`   ✅ ${labels[i]}: Sent`);
    } else {
      console.log(`   ⏭  ${labels[i]}: ${result.value?.reason || result.value?.error || 'Skipped'}`);
    }
  });

  console.log(`\n📨 Status update batch complete\n`);
}

module.exports = {
  sendUserWhatsApp,
  sendAdminWhatsApp,
  sendUserEmail,
  sendAllNotifications,
  sendStatusUpdateNotifications
};