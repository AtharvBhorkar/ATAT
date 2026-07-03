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

function buildFareBreakdown(notes, totalPrice) {
  const noteData = parseNotes(notes);
  const baseFare = noteData['Base Fare'] || null;
  const distCharge = noteData['Distance Charge'] || null;
  const driverAllow = noteData['Driver Allowance'] || null;
  const tollParking = noteData['Toll & Parking'] || null;
  const taxes = noteData['Taxes & Fees'] || null;

  if (!baseFare && !distCharge) {
    return `
      <tr>
        <td style="padding: 12px 16px; color: #777; font-size: 13px;">Estimated Total</td>
        <td style="padding: 12px 16px; text-align: right; font-weight: 700; font-size: 18px; color: #6E1F2B;">${formatCurrency(totalPrice)}</td>
      </tr>`;
  }

  return `
    <tr>
      <td style="padding: 10px 16px; color: #777; font-size: 13px; border-bottom: 1px solid #f0f0f0;">Base Fare</td>
      <td style="padding: 10px 16px; text-align: right; font-size: 13px; border-bottom: 1px solid #f0f0f0;">${baseFare || '—'}</td>
    </tr>
    <tr>
      <td style="padding: 10px 16px; color: #777; font-size: 13px; border-bottom: 1px solid #f0f0f0;">Distance Charge</td>
      <td style="padding: 10px 16px; text-align: right; font-size: 13px; border-bottom: 1px solid #f0f0f0;">${distCharge || '—'}</td>
    </tr>
    <tr>
      <td style="padding: 10px 16px; color: #777; font-size: 13px; border-bottom: 1px solid #f0f0f0;">Driver Allowance</td>
      <td style="padding: 10px 16px; text-align: right; font-size: 13px; border-bottom: 1px solid #f0f0f0;">${driverAllow || '—'}</td>
    </tr>
    <tr>
      <td style="padding: 10px 16px; color: #777; font-size: 13px; border-bottom: 1px solid #f0f0f0;">Toll & Parking (est.)</td>
      <td style="padding: 10px 16px; text-align: right; font-size: 13px; border-bottom: 1px solid #f0f0f0;">${tollParking || '—'}</td>
    </tr>
    <tr>
      <td style="padding: 10px 16px; color: #777; font-size: 13px; border-bottom: 1px solid #f0f0f0;">Taxes & Fees</td>
      <td style="padding: 10px 16px; text-align: right; font-size: 13px; border-bottom: 1px solid #f0f0f0;">${taxes || '—'}</td>
    </tr>
    <tr>
      <td style="padding: 14px 16px; font-weight: 700; font-size: 15px; color: #1a1a1a; border-top: 2px solid #6E1F2B;">Estimated Total</td>
      <td style="padding: 14px 16px; text-align: right; font-weight: 700; font-size: 20px; color: #6E1F2B; border-top: 2px solid #6E1F2B;">${formatCurrency(totalPrice)}</td>
    </tr>`;
}

function buildBookingEmailHTML(booking) {
  const noteData = parseNotes(booking.notes);
  const tripType = noteData['Trip Type'] || '—';
  const journeyTime = noteData['Time'] || '—';
  const distance = noteData['Distance'] || '—';
  const duration = noteData['Duration'] || '—';
  const luggage = noteData['Luggage'] || '—';
  const specialInstr = noteData['Special Instructions'] || '';

  const vehicleName = booking.vehicleId?.name || 'N/A';
  const vehicleModel = booking.vehicleId?.model || booking.vehicleId?.type || '';
  const vehicleSeats = booking.vehicleId?.seats || 'N/A';
  const vehicleBags = booking.vehicleId?.luggage || 'N/A';

  const packageName = booking.packageId?.title || booking.packageId?.name || '';
  const packageDest = booking.packageId?.destination || '';
  const packageDuration = booking.packageId?.duration || '';
  const isPackage = booking.bookingType === 'package';

  const safePickup = booking.pickupLocation || 'N/A';
  const safeDropoff = booking.dropoffLocation || 'N/A';
  const safeName = booking.name || 'Customer';
  const safeEmail = booking.email || 'N/A';
  const safePhone = booking.phone || 'N/A';

  let tripDetailsHTML = '';
  if (isPackage && packageName) {
    tripDetailsHTML = `
      <tr>
        <td style="padding: 11px 20px; color: #777; font-size: 13px; width: 40%; border-bottom: 1px solid #f5f5f5;">Package</td>
        <td style="padding: 11px 20px; font-size: 14px; font-weight: 600; border-bottom: 1px solid #f5f5f5;">${packageName}</td>
      </tr>
      ${packageDest ? `
      <tr>
        <td style="padding: 11px 20px; color: #777; font-size: 13px; border-bottom: 1px solid #f5f5f5;">Destination</td>
        <td style="padding: 11px 20px; font-size: 14px; font-weight: 600; border-bottom: 1px solid #f5f5f5;">${packageDest}</td>
      </tr>` : ''}
      <tr>
        <td style="padding: 11px 20px; color: #777; font-size: 13px; border-bottom: 1px solid #f5f5f5;">Travel Date</td>
        <td style="padding: 11px 20px; font-size: 14px; font-weight: 600; border-bottom: 1px solid #f5f5f5;">${formatDate(booking.pickupDate)}</td>
      </tr>
      ${packageDuration ? `
      <tr>
        <td style="padding: 11px 20px; color: #777; font-size: 13px;">Duration</td>
        <td style="padding: 11px 20px; font-size: 14px; font-weight: 600;">${packageDuration}</td>
      </tr>` : ''}`;
  } else {
    tripDetailsHTML = `
      <tr>
        <td style="padding: 11px 20px; color: #777; font-size: 13px; width: 40%; border-bottom: 1px solid #f5f5f5;">Pickup</td>
        <td style="padding: 11px 20px; font-size: 14px; font-weight: 600; border-bottom: 1px solid #f5f5f5;">${safePickup}</td>
      </tr>
      <tr>
        <td style="padding: 11px 20px; color: #777; font-size: 13px; border-bottom: 1px solid #f5f5f5;">Drop-off</td>
        <td style="padding: 11px 20px; font-size: 14px; font-weight: 600; border-bottom: 1px solid #f5f5f5;">${safeDropoff}</td>
      </tr>
      <tr>
        <td style="padding: 11px 20px; color: #777; font-size: 13px; border-bottom: 1px solid #f5f5f5;">Date & Time</td>
        <td style="padding: 11px 20px; font-size: 14px; font-weight: 600; border-bottom: 1px solid #f5f5f5;">${formatDate(booking.pickupDate)} at ${journeyTime}</td>
      </tr>
      <tr>
        <td style="padding: 11px 20px; color: #777; font-size: 13px; border-bottom: 1px solid #f5f5f5;">Trip Type</td>
        <td style="padding: 11px 20px; font-size: 14px; font-weight: 600; border-bottom: 1px solid #f5f5f5;">${tripType}</td>
      </tr>
      ${booking.returnDate ? `
      <tr>
        <td style="padding: 11px 20px; color: #777; font-size: 13px; border-bottom: 1px solid #f5f5f5;">Return Date</td>
        <td style="padding: 11px 20px; font-size: 14px; font-weight: 600; border-bottom: 1px solid #f5f5f5;">${formatDate(booking.returnDate)}</td>
      </tr>` : ''}
      <tr>
        <td style="padding: 11px 20px; color: #777; font-size: 13px; border-bottom: 1px solid #f5f5f5;">Estimated Distance</td>
        <td style="padding: 11px 20px; font-size: 14px; font-weight: 600; border-bottom: 1px solid #f5f5f5;">${distance}</td>
      </tr>
      <tr>
        <td style="padding: 11px 20px; color: #777; font-size: 13px;">Estimated Duration</td>
        <td style="padding: 11px 20px; font-size: 14px; font-weight: 600;">${duration}</td>
      </tr>`;
  }

  let vehicleHTML = '';
  if (!isPackage || vehicleName !== 'N/A') {
    vehicleHTML = `
      <tr>
        <td style="padding: 20px 40px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #ebebeb; border-radius: 8px; overflow: hidden;">
            <tr>
              <td colspan="2" style="background: #fafafa; padding: 12px 20px; border-bottom: 1px solid #ebebeb;">
                <p style="margin: 0; font-size: 14px; font-weight: 700; color: #6E1F2B;">🚐 Vehicle</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 11px 20px; color: #777; font-size: 13px; width: 40%; border-bottom: 1px solid #f5f5f5;">Selected</td>
              <td style="padding: 11px 20px; font-size: 14px; font-weight: 600; border-bottom: 1px solid #f5f5f5;">${vehicleName}${vehicleModel ? ' — ' + vehicleModel : ''}</td>
            </tr>
            <tr>
              <td style="padding: 11px 20px; color: #777; font-size: 13px;">Capacity</td>
              <td style="padding: 11px 20px; font-size: 14px; font-weight: 600;">${vehicleSeats} Seats &bull; ${vehicleBags} Bags</td>
            </tr>
          </table>
        </td>
      </tr>`;
  }

  let passengersHTML = '';
  if (!isPackage) {
    passengersHTML = `
      <tr>
        <td style="padding: 20px 40px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #ebebeb; border-radius: 8px; overflow: hidden;">
            <tr>
              <td colspan="2" style="background: #fafafa; padding: 12px 20px; border-bottom: 1px solid #ebebeb;">
                <p style="margin: 0; font-size: 14px; font-weight: 700; color: #6E1F2B;">👥 Passengers & Luggage</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 11px 20px; color: #777; font-size: 13px; width: 40%; border-bottom: 1px solid #f5f5f5;">Passengers</td>
              <td style="padding: 11px 20px; font-size: 14px; font-weight: 600; border-bottom: 1px solid #f5f5f5;">${booking.numberOfPeople || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 11px 20px; color: #777; font-size: 13px; border-bottom: 1px solid #f5f5f5;">Luggage Bags</td>
              <td style="padding: 11px 20px; font-size: 14px; font-weight: 600; border-bottom: 1px solid #f5f5f5;">${luggage}</td>
            </tr>
            ${specialInstr ? `
            <tr>
              <td style="padding: 11px 20px; color: #777; font-size: 13px;">Special Instructions</td>
              <td style="padding: 11px 20px; font-size: 13px; color: #555;">${specialInstr}</td>
            </tr>` : ''}
          </table>
        </td>
      </tr>`;
  } else {
    passengersHTML = `
      <tr>
        <td style="padding: 20px 40px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #ebebeb; border-radius: 8px; overflow: hidden;">
            <tr>
              <td colspan="2" style="background: #fafafa; padding: 12px 20px; border-bottom: 1px solid #ebebeb;">
                <p style="margin: 0; font-size: 14px; font-weight: 700; color: #6E1F2B;">👥 Travelers</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 11px 20px; color: #777; font-size: 13px; width: 40%;">Number of Travelers</td>
              <td style="padding: 11px 20px; font-size: 14px; font-weight: 600;">${booking.numberOfPeople || 1}</td>
            </tr>
          </table>
        </td>
      </tr>`;
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Booking Confirmed — ${booking.bookingId}</title>
</head>
<body style="margin: 0; padding: 0; background: #f0f0f0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f0f0f0; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 620px; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">

          <!-- HEADER WITH LOGO IMAGE -->
          <tr>
            <td style="background: #6E1F2B; padding: 28px 40px; text-align: center;">
              <img src="/assets/logo.png" alt="AMAN TOUR AND TRAVELS" width="280" style="display: block; margin: 0 auto 10px auto; border-radius: 6px;" />
              <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.8); letter-spacing: 1.5px; font-weight: 500;">SAFE JOURNEY, HAPPY JOURNEY</p>
            </td>
          </tr>

          <!-- SUCCESS BANNER -->
          <tr>
            <td style="background: #f9f0f1; padding: 24px 40px; text-align: center; border-bottom: 1px solid #f0e0e2;">
              <p style="margin: 0 0 4px 0; font-size: 22px; font-weight: 700; color: #2E7D32;">✓ Booking Confirmed!</p>
              <p style="margin: 0; font-size: 14px; color: #666;">Thank you for choosing Aman Tour and Travels</p>
            </td>
          </tr>

          <!-- BOOKING ID CARD -->
          <tr>
            <td style="padding: 28px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 2px dashed #6E1F2B; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="background: rgba(110,31,43,0.04); padding: 14px 20px; text-align: center;">
                    <p style="margin: 0 0 4px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #999; font-weight: 600;">Your Booking Reference ID</p>
                    <p style="margin: 0; font-size: 22px; font-weight: 700; color: #6E1F2B; letter-spacing: 1px;">${booking.bookingId}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- TRIP DETAILS -->
          <tr>
            <td style="padding: 28px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #ebebeb; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td colspan="2" style="background: #fafafa; padding: 12px 20px; border-bottom: 1px solid #ebebeb;">
                    <p style="margin: 0; font-size: 14px; font-weight: 700; color: #6E1F2B;">${isPackage ? '🎒 Package Details' : '📍 Trip Details'}</p>
                  </td>
                </tr>
                ${tripDetailsHTML}
              </table>
            </td>
          </tr>

          <!-- VEHICLE -->
          ${vehicleHTML}

          <!-- PASSENGERS -->
          ${passengersHTML}

          <!-- CUSTOMER -->
          <tr>
            <td style="padding: 20px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #ebebeb; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td colspan="2" style="background: #fafafa; padding: 12px 20px; border-bottom: 1px solid #ebebeb;">
                    <p style="margin: 0; font-size: 14px; font-weight: 700; color: #6E1F2B;">👤 Customer Details</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 11px 20px; color: #777; font-size: 13px; width: 40%; border-bottom: 1px solid #f5f5f5;">Full Name</td>
                  <td style="padding: 11px 20px; font-size: 14px; font-weight: 600; border-bottom: 1px solid #f5f5f5;">${safeName}</td>
                </tr>
                <tr>
                  <td style="padding: 11px 20px; color: #777; font-size: 13px; border-bottom: 1px solid #f5f5f5;">Email</td>
                  <td style="padding: 11px 20px; font-size: 14px; font-weight: 600; border-bottom: 1px solid #f5f5f5;">${safeEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 11px 20px; color: #777; font-size: 13px;${booking.gstNumber ? ' border-bottom: 1px solid #f5f5f5;' : ''}">Mobile</td>
                  <td style="padding: 11px 20px; font-size: 14px; font-weight: 600;${booking.gstNumber ? ' border-bottom: 1px solid #f5f5f5;' : ''}">${safePhone}</td>
                </tr>
                ${booking.gstNumber ? `
                <tr>
                  <td style="padding: 11px 20px; color: #777; font-size: 13px;">GST Number</td>
                  <td style="padding: 11px 20px; font-size: 14px; font-weight: 600;">${booking.gstNumber}</td>
                </tr>` : ''}
              </table>
            </td>
          </tr>

          <!-- FARE BREAKDOWN -->
          <tr>
            <td style="padding: 20px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 2px solid #6E1F2B; border-radius: 8px; overflow: hidden; background: rgba(110,31,43,0.02);">
                <tr>
                  <td colspan="2" style="background: rgba(110,31,43,0.06); padding: 12px 20px; border-bottom: 1px solid rgba(110,31,43,0.15);">
                    <p style="margin: 0; font-size: 14px; font-weight: 700; color: #6E1F2B;">💰 Fare Breakdown</p>
                  </td>
                </tr>
                ${buildFareBreakdown(booking.notes, booking.totalPrice)}
              </table>
            </td>
          </tr>

          <!-- FOOTER INFO -->
          <tr>
            <td style="padding: 32px 40px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #f9f9f9; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="padding: 18px 20px;">
                    <p style="margin: 0 0 10px 0; font-size: 13px; color: #555; line-height: 1.6;">
                      📞 Our team will contact you shortly with driver and vehicle details.<br/>
                      For any queries, call us at <strong>+91 1800-000-0000</strong>
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #999; line-height: 1.5;">
                      Please keep your Booking ID (<strong>${booking.bookingId}</strong>) handy for all future communications.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BRAND FOOTER -->
          <tr>
            <td style="background: #1a1a1a; padding: 24px 40px; text-align: center;">
              <img src="/assets/logo.png" alt="AMAN TOUR AND TRAVELS" width="160" style="display: block; margin: 0 auto 10px auto; border-radius: 4px; opacity: 0.9;" />
              <p style="margin: 0 0 12px 0; font-size: 10px; color: #aaa; letter-spacing: 1px;">SAFE JOURNEY, HAPPY JOURNEY</p>
              <p style="margin: 0; font-size: 11px; color: #666;">
                42, Travel Hub, MG Road, Pune, Maharashtra — 411001<br/>
                📞 +91 1800-000-0000 &nbsp;|&nbsp; ✉ hello@amantourandtravels.in
              </p>
              <p style="margin: 12px 0 0; font-size: 10px; color: #555;">
                &copy; ${new Date().getFullYear()} Aman Tour and Travels. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/* ═══════════════════════════════════════
   STATUS UPDATE EMAIL TEMPLATE
   ═══════════════════════════════════════ */
function buildStatusUpdateEmailHTML(booking) {
  const status = booking.status || 'pending';
  
  const statusConfig = {
    'confirmed': {
      icon: '✅',
      title: 'Ride Confirmed!',
      subtitle: 'Your booking has been confirmed. Driver details will be shared soon.',
      color: '#2E7D32',
      bgColor: '#e8f5e9'
    },
    'in-progress': {
      icon: '🚗',
      title: 'Ride In Progress',
      subtitle: 'Your driver is on the way. Have a safe journey!',
      color: '#1565C0',
      bgColor: '#e3f2fd'
    },
    'completed': {
      icon: '🎉',
      title: 'Trip Completed!',
      subtitle: 'Thank you for choosing Aman Tour and Travels. We hope you had a great journey!',
      color: '#2E7D32',
      bgColor: '#e8f5e9'
    },
    'cancelled': {
      icon: '❌',
      title: 'Booking Cancelled',
      subtitle: 'Your booking has been cancelled as per your request.',
      color: '#C62828',
      bgColor: '#ffebee'
    },
    'pending': {
      icon: '⏳',
      title: 'Booking Received',
      subtitle: 'We have received your booking and are reviewing it.',
      color: '#F57F17',
      bgColor: '#fff8e1'
    }
  };

  const config = statusConfig[status] || statusConfig['pending'];
  const safeName = booking.name || 'Customer';
  const isPackage = booking.bookingType === 'package';
  const routeInfo = isPackage 
    ? (booking.packageId?.title || 'Package Booking')
    : `${booking.pickupLocation || 'N/A'} → ${booking.dropoffLocation || 'N/A'}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Booking Update — ${booking.bookingId}</title>
</head>
<body style="margin: 0; padding: 0; background: #f0f0f0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f0f0f0; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">

          <!-- HEADER WITH LOGO IMAGE -->
          <tr>
            <td style="background: #6E1F2B; padding: 24px 40px; text-align: center;">
              <img src="/assets/logo.png" alt="AMAN TOUR AND TRAVELS" width="240" style="display: block; margin: 0 auto 8px auto; border-radius: 4px;" />
              <p style="margin: 0; font-size: 10px; color: rgba(255,255,255,0.75); letter-spacing: 1.5px;">SAFE JOURNEY, HAPPY JOURNEY</p>
            </td>
          </tr>

          <!-- STATUS BANNER -->
          <tr>
            <td style="background: ${config.bgColor}; padding: 28px 40px; text-align: center; border-bottom: 1px solid #e0e0e0;">
              <p style="margin: 0 0 8px 0; font-size: 36px;">${config.icon}</p>
              <p style="margin: 0 0 6px 0; font-size: 22px; font-weight: 700; color: ${config.color};">${config.title}</p>
              <p style="margin: 0; font-size: 14px; color: #666;">${config.subtitle}</p>
            </td>
          </tr>

          <!-- BOOKING ID -->
          <tr>
            <td style="padding: 24px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 2px dashed #6E1F2B; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="padding: 14px 20px; text-align: center;">
                    <p style="margin: 0 0 4px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #999; font-weight: 600;">Booking Reference ID</p>
                    <p style="margin: 0; font-size: 20px; font-weight: 700; color: #6E1F2B; letter-spacing: 1px;">${booking.bookingId}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- QUICK DETAILS -->
          <tr>
            <td style="padding: 0 40px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #ebebeb; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="padding: 12px 20px; color: #777; font-size: 13px; border-bottom: 1px solid #f5f5f5; width: 40%;">Customer</td>
                  <td style="padding: 12px 20px; font-size: 14px; font-weight: 600; border-bottom: 1px solid #f5f5f5;">${safeName}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; color: #777; font-size: 13px; border-bottom: 1px solid #f5f5f5;">Route</td>
                  <td style="padding: 12px 20px; font-size: 14px; font-weight: 600; border-bottom: 1px solid #f5f5f5;">${routeInfo}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; color: #777; font-size: 13px; border-bottom: 1px solid #f5f5f5;">Date</td>
                  <td style="padding: 12px 20px; font-size: 14px; font-weight: 600; border-bottom: 1px solid #f5f5f5;">${formatDate(booking.pickupDate)}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; color: #777; font-size: 13px; border-bottom: 1px solid #f5f5f5;">Status</td>
                  <td style="padding: 12px 20px; font-size: 14px; font-weight: 700; color: ${config.color};">${status.toUpperCase()}</td>
                </tr>
                ${status === 'cancelled' && booking.cancelReason ? `
                <tr>
                  <td style="padding: 12px 20px; color: #777; font-size: 13px;">Reason</td>
                  <td style="padding: 12px 20px; font-size: 13px; color: #C62828;">${booking.cancelReason}</td>
                </tr>` : ''}
                <tr>
                  <td style="padding: 12px 20px; color: #777; font-size: 13px;">Total Fare</td>
                  <td style="padding: 12px 20px; font-size: 16px; font-weight: 700; color: #6E1F2B;">${formatCurrency(booking.totalPrice)}</td>
                </tr>
              </table>
            </td>
          </tr>

          ${status === 'cancelled' ? `
          <!-- CANCELLATION NOTE -->
          <tr>
            <td style="padding: 0 40px 24px;">
              <div style="background: #fff3e0; border-left: 4px solid #FF9800; padding: 16px 20px; border-radius: 0 8px 8px 0;">
                <p style="margin: 0; font-size: 13px; color: #E65100; line-height: 1.5;">
                  <strong>Note:</strong> If you did not request this cancellation or have questions about refunds, please contact us immediately at <strong>+91 1800-000-0000</strong>.
                </p>
              </div>
            </td>
          </tr>` : ''}

          <!-- FOOTER INFO -->
          <tr>
            <td style="padding: 0 40px 24px;">
              <p style="margin: 0; font-size: 13px; color: #555; line-height: 1.6;">
                For any queries, call us at <strong>+91 1800-000-0000</strong> or email <strong>hello@amantourandtravels.in</strong>
              </p>
            </td>
          </tr>

          <!-- BRAND FOOTER -->
          <tr>
            <td style="background: #1a1a1a; padding: 24px 40px; text-align: center;">
              <img src="/assets/logo.png" alt="AMAN TOUR AND TRAVELS" width="140" style="display: block; margin: 0 auto 8px auto; border-radius: 4px; opacity: 0.9;" />
              <p style="margin: 0 0 8px 0; font-size: 9px; color: #aaa; letter-spacing: 1px;">SAFE JOURNEY, HAPPY JOURNEY</p>
              <p style="margin: 0; font-size: 10px; color: #555;">
                &copy; ${new Date().getFullYear()} Aman Tour and Travels. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

module.exports = { buildBookingEmailHTML, buildStatusUpdateEmailHTML };