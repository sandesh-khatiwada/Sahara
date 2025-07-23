import express from 'express';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import Session from '../models/Session.js';

const router = express.Router();

// eSewa configuration
const esewaConfig = {
  merchantId: 'EPAYTEST',
  secretKey: '8gBm/:&EnhH.1/q',
  paymentUrl: 'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
  verificationUrl: 'https://rc-epay.esewa.com.np/api/epay/transaction',
  successUrl: `${process.env.API_BASE_URL}/api/payments/success`,
  failureUrl: `${process.env.API_BASE_URL}/api/payments/failure`,
};

// Generate auto-submitting HTML form
const generatePaymentForm = (paymentData, paymentUrl) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>eSewa Payment</title>
        <script>
          window.onload = function() {
            document.getElementById('esewaForm').submit();
          };
        </script>
      </head>
      <body>
        <h3>Redirecting to eSewa...</h3>
        <form id="esewaForm" action="${paymentUrl}" method="POST">
          ${Object.entries(paymentData)
            .map(([key, value]) => `<input type="hidden" name="${key}" value="${value}">`)
            .join('')}
        </form>
      </body>
    </html>
  `;
};

// Generate redirect HTML page
const generateRedirectPage = (deepLink, message, buttonText) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Payment Redirect</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script>
          window.onload = function() {
            console.log('Attempting redirect to: ${deepLink}');
            window.location.href = '${deepLink}';
            setTimeout(function() {
              document.getElementById('fallbackMessage').style.display = 'block';
            }, 2000);
          };
        </script>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
          h3 { color: #003087; }
          .button { display: inline-block; padding: 10px 20px; background-color: #007AFF; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          #fallbackMessage { display: none; }
        </style>
      </head>
      <body>
        <h3>${message}</h3>
        <div id="fallbackMessage">
          <p>You can return to the app now.</p>
        </div>
      </body>
    </html>
  `;
};

// Initiate payment
router.post('/initiate', async (req, res) => {
  const startTime = new Date().toISOString();
  console.log('Initiate payment started:', startTime);
  console.log('Callback URLs:', { successUrl: esewaConfig.successUrl, failureUrl: esewaConfig.failureUrl });

  const { appointmentId } = req.body;

  if (!appointmentId) {
    console.error('Missing appointmentId:', { appointmentId });
    return res.status(400).json({ success: false, message: 'appointmentId is required' });
  }

  // Verify session exists and get counsellor chargePerHour
  let session;
  try {
    session = await Session.findById(appointmentId).populate('counsellor');
    if (!session) {
      console.error('Session not found:', appointmentId);
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    if (session.paymentStatus === 'completed') {
      console.warn('Payment already completed:', appointmentId);
      return res.status(400).json({ success: false, message: 'Payment already completed for this session' });
    }
    if (!session.counsellor || !session.counsellor.chargePerHour) {
      console.error('Counsellor or chargePerHour not found for session:', appointmentId);
      return res.status(400).json({ success: false, message: 'Counsellor or chargePerHour not found' });
    }
  } catch (error) {
    console.error('Error verifying session:', error);
    return res.status(500).json({ success: false, message: 'Failed to verify session' });
  }

  const amount = session.counsellor.chargePerHour;
  console.log('Amount fetched from counsellor:', amount);

  const transaction_uuid = `${appointmentId}-${uuidv4()}`;
  const paymentData = {
    amount: amount.toString(),
    tax_amount: '0',
    total_amount: amount.toString(),
    transaction_uuid,
    product_code: esewaConfig.merchantId,
    product_service_charge: '0',
    product_delivery_charge: '0',
    success_url: esewaConfig.successUrl,
    failure_url: esewaConfig.failureUrl,
    signed_field_names: 'total_amount,transaction_uuid,product_code',
    signature: crypto
      .createHmac('sha256', esewaConfig.secretKey)
      .update(`total_amount=${amount.toString()},transaction_uuid=${transaction_uuid},product_code=${esewaConfig.merchantId}`)
      .digest('base64'),
  };

  console.log('Payment data:', paymentData);

  // Store transaction_uuid in Session
  try {
    await Session.findByIdAndUpdate(appointmentId, { transaction_uuid, paymentStatus: 'pending' });
  } catch (error) {
    console.error('Error storing transaction_uuid:', error);
    return res.status(500).json({ success: false, message: 'Failed to store transaction data' });
  }

  // Generate form URL
  const formUrl = `${req.protocol}://${req.get('host')}/api/payments/form/${transaction_uuid}`;
  console.log('Generated form URL:', formUrl);

  res.json({ success: true, formUrl, startTime });
});

// Serve auto-submitting form
router.get('/form/:transaction_uuid', async (req, res) => {
  const { transaction_uuid } = req.params;

  try {
    const session = await Session.findOne({ transaction_uuid }).populate('counsellor');
    if (!session) {
      console.error('Session not found for transaction_uuid:', transaction_uuid);
      return res.status(404).send('Session not found');
    }
    if (!session.counsellor || !session.counsellor.chargePerHour) {
      console.error('Counsellor or chargePerHour not found for session:', transaction_uuid);
      return res.status(400).send('Counsellor or chargePerHour not found');
    }

    const amount = session.counsellor.chargePerHour;
    const paymentData = {
      amount: amount.toString(),
      tax_amount: '0',
      total_amount: amount.toString(),
      transaction_uuid,
      product_code: esewaConfig.merchantId,
      product_service_charge: '0',
      product_delivery_charge: '0',
      success_url: esewaConfig.successUrl,
      failure_url: esewaConfig.failureUrl,
      signed_field_names: 'total_amount,transaction_uuid,product_code',
      signature: crypto
        .createHmac('sha256', esewaConfig.secretKey)
        .update(`total_amount=${amount.toString()},transaction_uuid=${transaction_uuid},product_code=${esewaConfig.merchantId}`)
        .digest('base64'),
    };

    const formHtml = generatePaymentForm(paymentData, esewaConfig.paymentUrl);
    res.set('Content-Type', 'text/html');
    res.send(formHtml);
  } catch (error) {
    console.error('Error generating payment form:', error);
    res.status(500).send('Failed to generate payment form');
  }
});

// Handle success callback
router.get('/success', async (req, res) => {
  try {
    const { data } = req.query;
    console.log('Success callback received at:', new Date().toISOString(), { data });

    // Update session payment status (minimal check)
    let appointmentId;
    if (data) {
      const decoded = JSON.parse(Buffer.from(data, 'base64').toString());
      appointmentId = decoded.transaction_uuid.split('-')[0];
      try {
        const session = await Session.findByIdAndUpdate(
          appointmentId,
          { paymentStatus: 'completed', transaction_uuid: decoded.transaction_uuid },
          { new: true }
        );
        if (!session) {
          console.error('Session not found for update:', appointmentId);
          return res.set('Content-Type', 'text/html').send(
            generateRedirectPage('sahara://payment/failure', 'Session not found.')
          );
        }
      } catch (error) {
        console.error('Error updating session payment status:', error);
        return res.set('Content-Type', 'text/html').send(
          generateRedirectPage('sahara://payment/failure', 'Error processing payment.')
        );
      }
    } else {
      console.warn('No data provided in success callback');
    }

    res.set('Content-Type', 'text/html').send(
      generateRedirectPage('sahara://payment/success', 'Payment successful!')
    );
  } catch (error) {
    console.error('Payment success error:', error);
    res.set('Content-Type', 'text/html').send(
      generateRedirectPage('sahara://payment/failure', 'Error processing payment.')
    );
  }
});

// Handle failure callback
router.get('/failure', async (req, res) => {
  try {
    const { data } = req.query;
    console.log('Failure callback received at:', new Date().toISOString(), { data });
    if (data) {
      const decoded = JSON.parse(Buffer.from(data, 'base64').toString());
      const appointmentId = decoded.transaction_uuid.split('-')[0];
      await Session.findByIdAndUpdate(appointmentId, { paymentStatus: 'failed', transaction_uuid: decoded.transaction_uuid });
      console.log('Failure callback processed:', decoded);
    }
    res.set('Content-Type', 'text/html').send(
      generateRedirectPage('sahara://payment/failure', 'Payment failed or was cancelled.')
    );
  } catch (error) {
    console.error('Payment failure error:', error);
    res.set('Content-Type', 'text/html').send(
      generateRedirectPage('sahara://payment/failure', 'Error processing payment.')
    );
  }
});

export default router;