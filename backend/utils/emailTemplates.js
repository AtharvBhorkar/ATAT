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
  
    /* Only show breakdown if we have the data */
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
  
    const vehicleName = booking.vehicleId?.name || 'N/A';
    const vehicleModel = booking.vehicleId?.model || booking.vehicleId?.type || '';
    const vehicleSeats = booking.vehicleId?.seats || 'N/A';
    const vehicleBags = booking.vehicleId?.luggage || 'N/A';
  
    /* Extract special instructions from notes (last segment after 'Special Instructions') */
    const specialInstr = noteData['Special Instructions'] || '';
  
    return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Booking Confirmed — ${booking.bookingId}</title>
  </head>
  <body style="margin: 0; padding: 0; background: #f0f0f0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  
    <!-- Outer wrapper -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background: #f0f0f0; padding: 40px 20px;">
      <tr>
        <td align="center">
  
          <!-- Email card -->
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 620px; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
  
            <!-- ═══ HEADER ═══ -->
            <tr>
              <td style="background: #6E1F2B; padding: 32px 40px; text-align: center;">
                <h1 style="margin: 0 0 6px 0; font-size: 26px; font-weight: 700; color: #ffffff; letter-spacing: 3px;">VOYAGO</h1>
                <p style="margin: 0; font-size: 13px; color: rgba(255,255,255,0.75); letter-spacing: 1px;">TOURS & TRAVELS</p>
              </td>
            </tr>
  
            <!-- ═══ SUCCESS BANNER ═══ -->
            <tr>
              <td style="background: #f9f0f1; padding: 24px 40px; text-align: center; border-bottom: 1px solid #f0e0e2;">
                <p style="margin: 0 0 4px 0; font-size: 22px; font-weight: 700; color: #2E7D32;">✓ Booking Confirmed!</p>
                <p style="margin: 0; font-size: 14px; color: #666;">Thank you for choosing Voyago Tours & Travels</p>
              </td>
            </tr>
  
            <!-- ═══ BOOKING ID CARD ═══ -->
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
  
            <!-- ═══ TRIP DETAILS ═══ -->
            <tr>
              <td style="padding: 28px 40px 0;">
                <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #ebebeb; border-radius: 8px; overflow: hidden;">
                  <!-- Section header -->
                  <tr>
                    <td colspan="2" style="background: #fafafa; padding: 12px 20px; border-bottom: 1px solid #ebebeb;">
                      <p style="margin: 0; font-size: 14px; font-weight: 700; color: #6E1F2B;">📍 Trip Details</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 11px 20px; color: #777; font-size: 13px; width: 40%; border-bottom: 1px solid #f5f5f5;">Pickup</td>
                    <td style="padding: 11px 20px; font-size: 14px; font-weight: 600; border-bottom: 1px solid #f5f5f5;">${booking.pickupLocation}</td>
                  </tr>
                  <tr>
                    <td style="padding: 11px 20px; color: #777; font-size: 13px; border-bottom: 1px solid #f5f5f5;">Drop-off</td>
                    <td style="padding: 11px 20px; font-size: 14px; font-weight: 600; border-bottom: 1px solid #f5f5f5;">${booking.dropoffLocation}</td>
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
                  </tr>
                </table>
              </td>
            </tr>
  
            <!-- ═══ VEHICLE ═══ -->
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
            </tr>
  
            <!-- ═══ PASSENGERS ═══ -->
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
                    <td style="padding: 11px 20px; font-size: 14px; font-weight: 600; border-bottom: 1px solid #f5f5f5;">${booking.numberOfPeople}</td>
                  </tr>
                  <tr>
                    <td style="padding: 11px 20px; color: #777; font-size: 13px;">Luggage Bags</td>
                    <td style="padding: 11px 20px; font-size: 14px; font-weight: 600;">${luggage}</td>
                  </tr>
                  ${specialInstr ? `
                  <tr>
                    <td style="padding: 11px 20px; color: #777; font-size: 13px;">Special Instructions</td>
                    <td style="padding: 11px 20px; font-size: 13px; color: #555;">${specialInstr}</td>
                  </tr>` : ''}
                </table>
              </td>
            </tr>
  
            <!-- ═══ CUSTOMER ═══ -->
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
                    <td style="padding: 11px 20px; font-size: 14px; font-weight: 600; border-bottom: 1px solid #f5f5f5;">${booking.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 11px 20px; color: #777; font-size: 13px; border-bottom: 1px solid #f5f5f5;">Email</td>
                    <td style="padding: 11px 20px; font-size: 14px; font-weight: 600; border-bottom: 1px solid #f5f5f5;">${booking.email}</td>
                  </tr>
                  <tr>
                    <td style="padding: 11px 20px; color: #777; font-size: 13px;${booking.gstNumber ? ' border-bottom: 1px solid #f5f5f5;' : ''}">Mobile</td>
                    <td style="padding: 11px 20px; font-size: 14px; font-weight: 600;${booking.gstNumber ? ' border-bottom: 1px solid #f5f5f5;' : ''}">${booking.phone}</td>
                  </tr>
                  ${booking.gstNumber ? `
                  <tr>
                    <td style="padding: 11px 20px; color: #777; font-size: 13px;">GST Number</td>
                    <td style="padding: 11px 20px; font-size: 14px; font-weight: 600;">${booking.gstNumber}</td>
                  </tr>` : ''}
                </table>
              </td>
            </tr>
  
            <!-- ═══ FARE BREAKDOWN ═══ -->
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
  
            <!-- ═══ FOOTER INFO ═══ -->
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
  
            <!-- ═══ BRAND FOOTER ═══ -->
            <tr>
              <td style="background: #1a1a1a; padding: 24px 40px; text-align: center;">
                <p style="margin: 0 0 4px 0; font-size: 16px; font-weight: 700; color: #fff; letter-spacing: 2px;">VOYAGO</p>
                <p style="margin: 0 0 12px 0; font-size: 11px; color: #888;">TOURS & TRAVELS</p>
                <p style="margin: 0; font-size: 11px; color: #666;">
                  42, Travel Hub, MG Road, Pune, Maharashtra — 411001<br/>
                  📞 +91 1800-000-0000 &nbsp;|&nbsp; ✉ hello@voyago.in
                </p>
                <p style="margin: 12px 0 0; font-size: 10px; color: #555;">
                  &copy; ${new Date().getFullYear()} Voyago Tours & Travels. All rights reserved.
                </p>
              </td>
            </tr>
  
          </table>
          <!-- /Email card -->
  
        </td>
      </tr>
    </table>
    <!-- /Outer wrapper -->
  
  </body>
  </html>`;
  }
  
  module.exports = { buildBookingEmailHTML };