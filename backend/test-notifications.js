require('dotenv').config();
const { sendUserEmail, sendUserWhatsApp, sendAdminWhatsApp } = require('./utils/notifications');

async function test() {
  const testBooking = {
    bookingId: 'TEST001',
    name: 'Test User',
    email: process.env.SENDER_EMAIL, // Send to yourself
    phone: '9876543210', // Your phone number
    bookingType: 'ride',
    pickupLocation: 'Mumbai, Maharashtra',
    dropoffLocation: 'Pune, Maharashtra',
    pickupDate: new Date().toISOString(),
    numberOfPeople: 2,
    totalPrice: 4800,
    status: 'pending',
    notes: 'Trip Type: One Way|Time: 10:00 AM|Distance: 150 km|Duration: 2h 45m|Luggage: 2 Bags|Base Fare: ₹ 2,850|Distance Charge: ₹ 900|Driver Allowance: ₹ 400|Toll & Parking: ₹ 350|Taxes & Fees: ₹ 300',
    vehicleId: {
      name: 'Sedan',
      model: 'Dezire / Etios',
      seats: 4,
      luggage: 2
    },
    packageId: null
  };

  console.log('Testing Email...');
  const emailResult = await sendUserEmail(testBooking, false);
  console.log('Email Result:', emailResult);

  console.log('\nTesting WhatsApp...');
  const whatsappResult = await sendUserWhatsApp(testBooking, false);
  console.log('WhatsApp Result:', whatsappResult);
}

test().catch(console.error);