import { connectDatabase, disconnectDatabase } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Show } from '../src/models/Show.js';
import { Screen } from '../src/models/Screen.js';
import { calculateAuthoritativePricing } from '../src/services/pricingService.js';
import { createSeatHold, convertHoldToSold } from '../src/services/seatService.js';
import { verifyPaymentSignature } from '../src/services/paymentService.js';

async function runTestSuite() {
  console.log('🧪 Starting CineNova Automated Test Suite...');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    await connectDatabase();

    // Test 1: User authentication & roles
    const admin = await User.findOne({ email: 'admin@cinenova.live' });
    assert(Boolean(admin && admin.role === 'admin'), 'Admin account exists with admin role');

    const customer = await User.findOne({ email: 'ayush@cinenova.live' });
    assert(Boolean(customer && customer.role === 'customer'), 'Customer account exists with customer role');

    const isMatch = await customer!.comparePassword('Customer@123456');
    assert(isMatch, 'Password hashing and verification matches candidate password');

    const wrongMatch = await customer!.comparePassword('WrongPassword123');
    assert(!wrongMatch, 'Invalid password is appropriately rejected');

    // Test 2: Server-side pricing calculation
    const show = await Show.findOne({ status: 'scheduled', startTime: { $gt: new Date() } });
    assert(Boolean(show), 'Scheduled show exists in database');

    const screen = await Screen.findById(show!.screenId);
    assert(Boolean(screen), 'Screen auditorium exists for show');

    const pricing = await calculateAuthoritativePricing({
      show: show!,
      screen: screen!,
      selectedSeatIds: ['A1', 'A2'],
      user: customer,
    });

    assert(pricing.baseAmount > 0, 'Base ticket amount calculated correctly');
    assert(pricing.convenienceFee === 0, 'Convenience fee 100% waived for CineNova Plus subscriber');
    assert(pricing.convenienceFeeWaived === true, 'Convenience fee waiver flag set to true');
    assert(pricing.totalAmount > 0, 'Final authoritative total amount calculated correctly');

    // Test 3: Concurrency safe seat holds
    const hold = await createSeatHold(show!._id.toString(), customer!._id.toString(), ['B5', 'B6']);
    assert(Boolean(hold.holdToken && hold.seatIds.length === 2), 'Active seat hold created successfully');

    // Test 4: Concurrency conflict rejection
    let conflictCaught = false;
    try {
      const otherUser = await User.findOne({ email: 'theatre@cinenova.live' });
      await createSeatHold(show!._id.toString(), otherUser!._id.toString(), ['B5', 'B7']);
    } catch (err: any) {
      if (err.message.includes('temporarily held')) {
        conflictCaught = true;
      }
    }
    assert(conflictCaught, 'Simultaneous hold attempt on same seat B5 is rejected');

    // Test 5: Atomic sold conversion to prevent double booking
    const soldSuccess = await convertHoldToSold(show!._id.toString(), ['H5', 'H6']);
    assert(soldSuccess, 'Atomic seat conversion to sold succeeds');

    let doubleBookingCaught = false;
    try {
      await convertHoldToSold(show!._id.toString(), ['H5', 'H6']);
    } catch (err: any) {
      if (err.message.includes('Double-booking prevented')) {
        doubleBookingCaught = true;
      }
    }
    assert(doubleBookingCaught, 'Double-booking of seats H5, H6 is permanently blocked');

    // Test 6: Payment signature verification
    const validSig = verifyPaymentSignature({
      orderId: 'order_cn_demo1234',
      paymentId: 'pay_cn_demo5678',
      signature: 'sig_test_pay_cn_demo5678',
    });
    assert(validSig, 'Valid Razorpay signature correctly authenticated');

    const invalidSig = verifyPaymentSignature({
      orderId: 'order_live_fake',
      paymentId: 'pay_live_fake',
      signature: 'tampered_signature_attack',
    });
    assert(!invalidSig, 'Forged payment signature correctly rejected');

    console.log(`\n===========================================`);
    console.log(`🎉 TEST SUMMARY: ${passed} passed, ${failed} failed`);
    console.log(`===========================================\n`);

    await disconnectDatabase();
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Fatal test error:', err);
    await disconnectDatabase();
    process.exit(1);
  }
}

runTestSuite();
