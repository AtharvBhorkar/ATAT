require('dotenv').config();
const twilio = require('twilio');
const SibApiV3Sdk = require('sib-api-v3-sdk');
const { buildBookingEmailHTML, buildStatusUpdateEmailHTML } = require('./emailTemplates');

/* ═══════════════════════════════════════
   BREVO EMAIL CLIENT (lazy init)
   ═══════════════════════════════════════ */
let brevoApiInstance = null;

function getBrevoApi() {
  if (!brevoApiInstance && process.env.BREVO_API_KEY) {
    try {
      const defaultClient = SibApiV3Sdk.ApiClient.instance;
      defaultClient.basePath = 'https://api.brevo.com/v3';
      defaultClient.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;
      brevoApiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
      console.log('✅ Brevo API initialized successfully');
    } catch (err) {
      console.error('❌ Brevo API initialization failed:', err.message);
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
      console.log('✅ Twilio client initialized successfully');
    } catch (err) {
      console.error('❌ Twilio initialization failed:', err.message);
      return null;
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
   BUILD WHATSAPP MESSAGE — USER
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

  let msg = `🚗 *VOYAGO BOOKING CONFIRMED*\n`;
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
  msg += `Thank you for choosing Voyago! 🙏\n`;
  msg += `Our team will contact you shortly.`;

  return msg;
}

/* ═══════════════════════════════════════
   BUILD WHATSAPP MESSAGE — ADMIN
   ═══════════════════════════════════════ */
function buildAdminWhatsAppMessage(booking) {
  const vehicleName = booking.vehicleId?.name || 'N/A';
  const packageName = booking.packageId?.title || booking.packageId?.name || '';
  const noteData = parseNotes(booking.notes);
  const tripType = noteData['Trip Type'] || '';
  const isPackage = booking.bookingType === 'package';

  let msg = `📋 *NEW BOOKING — VOYAGO*\n`;
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

/* ═══════════════════════════════════════
   BUILD STATUS UPDATE WHATSAPP — USER
   ═══════════════════════════════════════ */
function buildStatusUpdateWhatsAppMessage(booking) {
  const status = booking.status || 'pending';
  const statusEmojis = {
    'confirmed': '✅',
    'in-progress': '🚗',
    'completed': '🎉',
    'cancelled': '❌',
    'pending': '⏳'
  };
  const emoji = statusEmojis[status] || '📢';

  let msg = `${emoji} *VOYAGO BOOKING UPDATE*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  msg += `📋 *Booking ID*\n${booking.bookingId}\n\n`;
  msg += `📊 *Status*: ${status.toUpperCase()}\n\n`;

  if (status === 'cancelled' && booking.cancelReason) {
    msg += `📝 *Reason*: ${booking.cancelReason}\n\n`;
  }

  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  
  if (status === 'confirmed') {
    msg += `Your ride has been confirmed! Our team will share driver details soon.`;
  } else if (status === 'cancelled') {
    msg += `Your booking has been cancelled. If you have questions, contact us at +91 1800-000-0000`;
  } else if (status === 'completed') {
    msg += `Your trip is complete! Thank you for choosing Voyago. We hope you had a great journey! 🙏`;
  } else if (status === 'in-progress') {
    msg += `Your ride is now in progress. Have a safe journey!`;
  } else {
    msg += `Your booking is being reviewed. We'll update you shortly.`;
  }

  return msg;
}

/* ═══════════════════════════════════════
   SEND WHATSAPP TO USER
   ═══════════════════════════════════════ */
async function sendUserWhatsApp(booking, isStatusUpdate = false) {
  const client = getTwilioClient();
  if (!client || !process.env.TWILIO_WHATSAPP_FROM) {
    console.log('⏭  Skipping user WhatsApp — Twilio not configured');
    return { success: false, reason: 'Twilio not configured' };
  }

  if (!booking.phone) {
    console.log('⏭  Skipping user WhatsApp — No phone number');
    return { success: false, reason: 'No phone number' };
  }

  let toPhone = booking.phone.toString().trim();
  if (!toPhone.startsWith('+')) {
    toPhone = '+91' + toPhone.replace(/\D/g, '');
  }

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
    return { success: false, error: err.message };
  }
}

/* ═══════════════════════════════════════
   SEND WHATSAPP TO ADMIN
   ═══════════════════════════════════════ */
async function sendAdminWhatsApp(booking) {
  const client = getTwilioClient();
  if (!client || !process.env.TWILIO_WHATSAPP_FROM) {
    console.log('⏭  Skipping admin WhatsApp — Twilio not configured');
    return { success: false, reason: 'Twilio not configured' };
  }

  if (!process.env.ADMIN_WHATSAPP) {
    console.log('⏭  Skipping admin WhatsApp — ADMIN_WHATSAPP not set in .env');
    return { success: false, reason: 'ADMIN_WHATSAPP not configured' };
  }

  let toPhone = process.env.ADMIN_WHATSAPP.trim();
  if (!toPhone.startsWith('+')) {
    toPhone = '+91' + toPhone.replace(/\D/g, '');
  }

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
    console.log('⏭  Skipping user email — Brevo not configured');
    return { success: false, reason: 'Brevo not configured' };
  }

  if (!booking.email) {
    console.log('⏭  Skipping user email — No email address');
    return { success: false, reason: 'No email address' };
  }

  try {
    const htmlContent = isStatusUpdate 
      ? buildStatusUpdateEmailHTML(booking)
      : buildBookingEmailHTML(booking);

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.sender = {
      name: process.env.SENDER_NAME || 'Voyago Tours & Travels',
      email: process.env.SENDER_EMAIL || 'noreply@voyago.in'
    };
    sendSmtpEmail.to = [{ email: booking.email, name: booking.name || 'Customer' }];
    
    if (process.env.REPLY_TO) {
      sendSmtpEmail.replyTo = { email: process.env.REPLY_TO };
    }

    const status = booking.status || 'confirmed';
    if (isStatusUpdate) {
      const subjectMap = {
        'confirmed': `Ride Confirmed — ${booking.bookingId} | Voyago`,
        'in-progress': `Ride In Progress — ${booking.bookingId} | Voyago`,
        'completed': `Trip Completed — ${booking.bookingId} | Voyago`,
        'cancelled': `Booking Cancelled — ${booking.bookingId} | Voyago`,
        'pending': `Booking Received — ${booking.bookingId} | Voyago`
      };
      sendSmtpEmail.subject = subjectMap[status] || `Booking Update — ${booking.bookingId} | Voyago`;
    } else {
      sendSmtpEmail.subject = `Booking Confirmed — ${booking.bookingId} | Voyago Tours & Travels`;
    }

    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.headers = {
      'X-Mailin-custom': isStatusUpdate ? 'voyago-status-update' : 'voyago-booking-confirmation'
    };

    const result = await api.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ Brevo email sent to: ${booking.email} (messageId: ${result.messageId})`);
    return { success: true, messageId: result.messageId };
  } catch (err) {
    console.error('❌ Brevo email failed:', err.message);
    if (err.responseBody) {
      console.error('   Brevo error details:', JSON.stringify(err.responseBody, null, 2));
    }
    return { success: false, error: err.message, details: err.responseBody };
  }
}

/* ═══════════════════════════════════════
   MASTER: SEND ALL NOTIFICATIONS (New Booking)
   ═══════════════════════════════════════ */
async function sendAllNotifications(booking) {
  console.log(`\n📨 ════════════════════════════════════════════════════════════════`);
  console.log(`📨 STARTING NOTIFICATION BATCH FOR BOOKING`);
  console.log(`📨 ════════════════════════════════════════════════════════════════`);
  console.log(`📨 Booking ID: ${booking.bookingId}`);
  console.log(`📨 Customer: ${booking.name}`);
  console.log(`📨 Email: ${booking.email || 'N/A'}`);
  console.log(`📨 Phone: ${booking.phone || 'N/A'}`);
  console.log(`📨 Type: ${booking.bookingType || 'ride'}`);
  console.log(`📨 Status: ${booking.status || 'pending'}`);
  console.log(`📨 ════════════════════════════════════════════════════════════════\n`);

  const results = await Promise.allSettled([
    sendUserWhatsApp(booking, false),
    sendAdminWhatsApp(booking),
    sendUserEmail(booking, false)
  ]);

  const labels = ['User WhatsApp', 'Admin WhatsApp', 'User Email'];
  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      const r = result.value;
      if (r.success) {
        console.log(`   ✅ ${labels[i]}: Success`);
      } else {
        console.log(`   ⏭  ${labels[i]}: Skipped - ${r.reason || r.error || 'Unknown'}`);
      }
    } else {
      console.error(`   ❌ ${labels[i]}: Error - ${result.reason?.message || 'Unknown'}`);
    }
  });

  console.log(`\n📨 ════════════════════════════════════════════════════════════════`);
  console.log(`📨 NOTIFICATION BATCH COMPLETED FOR ${booking.bookingId}`);
  console.log(`📨 ════════════════════════════════════════════════════════════════\n`);
}

/* ═══════════════════════════════════════
   SEND STATUS UPDATE NOTIFICATIONS
   ═══════════════════════════════════════ */
async function sendStatusUpdateNotifications(booking) {
  console.log(`\n📨 ════════════════════════════════════════════════════════════════`);
  console.log(`📨 SENDING STATUS UPDATE NOTIFICATIONS`);
  console.log(`📨 Booking ID: ${booking.bookingId}`);
  console.log(`📨 New Status: ${booking.status}`);
  console.log(`📨 ════════════════════════════════════════════════════════════════\n`);

  const results = await Promise.allSettled([
    sendUserWhatsApp(booking, true),
    sendAdminWhatsApp(booking),
    sendUserEmail(booking, true)
  ]);

  const labels = ['User WhatsApp', 'Admin WhatsApp', 'User Email'];
  results.forEach((result, i) => {
    if (result.status === 'fulfilled' && result.value.success) {
      console.log(`   ✅ ${labels[i]}: Status update sent`);
    } else {
      console.log(`   ⏭  ${labels[i]}: Skipped or failed`);
    }
  });

  console.log(`\n📨 ════════════════════════════════════════════════════════════════`);
  console.log(`📨 STATUS UPDATE NOTIFICATIONS COMPLETED FOR ${booking.bookingId}`);
  console.log(`📨 ════════════════════════════════════════════════════════════════\n`);
}

module.exports = {
  sendUserWhatsApp,
  sendAdminWhatsApp,
  sendUserEmail,
  sendAllNotifications,
  sendStatusUpdateNotifications
};
