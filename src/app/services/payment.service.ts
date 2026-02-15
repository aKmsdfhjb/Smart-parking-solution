// Payment Service
// Handles eSewa and Khalti payment gateway integration

import { EsewaPaymentResponse, KhaltiPaymentResponse } from '../types';

// ===================================
// ESEWA PAYMENT INTEGRATION
// ===================================

interface EsewaConfig {
  amount: number;
  transactionId: string;
  productName: string;
  successUrl: string;
  failureUrl: string;
}

/**
 * Initialize eSewa payment
 * Documentation: https://developer.esewa.com.np/pages/Epay
 */
export function initEsewaPayment(config: EsewaConfig): void {
  const {
    amount,
    transactionId,
    productName,
    successUrl,
    failureUrl,
  } = config;

  // eSewa configuration
  const merchantId = 'EPAYTEST'; // Replace with actual merchant ID in production
  const secretKey = 'YOUR_ESEWA_SECRET_KEY'; // Replace with your secret key

  // Create payment form
  const form = document.createElement('form');
  form.setAttribute('method', 'POST');
  form.setAttribute('action', 'https://uat.esewa.com.np/epay/main'); // Use https://esewa.com.np/epay/main for production

  // Add form fields
  const fields = {
    amt: amount.toString(),
    psc: '0',
    pdc: '0',
    txAmt: '0',
    tAmt: amount.toString(),
    pid: transactionId,
    scd: merchantId,
    su: successUrl,
    fu: failureUrl,
  };

  Object.entries(fields).forEach(([key, value]) => {
    const input = document.createElement('input');
    input.setAttribute('type', 'hidden');
    input.setAttribute('name', key);
    input.setAttribute('value', value);
    form.appendChild(input);
  });

  // Submit form
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}

/**
 * Verify eSewa payment response
 * This should be called from success URL
 */
export function verifyEsewaPayment(
  queryParams: URLSearchParams
): EsewaPaymentResponse {
  const oid = queryParams.get('oid');
  const amt = queryParams.get('amt');
  const refId = queryParams.get('refId');

  if (oid && amt && refId) {
    return {
      status: 'success',
      transactionId: oid,
      amount: parseFloat(amt),
      refId,
    };
  }

  return { status: 'failed' };
}

/**
 * Mock eSewa payment for development
 */
export function mockEsewaPayment(
  amount: number,
  transactionId: string,
  successCallback: (response: EsewaPaymentResponse) => void
): void {
  // Simulate payment processing
  setTimeout(() => {
    const response: EsewaPaymentResponse = {
      status: 'success',
      transactionId,
      amount,
      refId: `ESEWA${Date.now()}`,
    };
    successCallback(response);
  }, 2000);
}

// ===================================
// KHALTI PAYMENT INTEGRATION
// ===================================

interface KhaltiConfig {
  publicKey: string;
  amount: number;
  productIdentity: string;
  productName: string;
  productUrl?: string;
  onSuccess: (response: any) => void;
  onError: (error: any) => void;
}

/**
 * Initialize Khalti payment
 * Documentation: https://docs.khalti.com/
 */
export function initKhaltiPayment(config: KhaltiConfig): void {
  const publicKey = 'test_public_key_YOUR_KEY'; // Replace with actual key

  // Check if Khalti script is loaded
  if (typeof (window as any).KhaltiCheckout === 'undefined') {
    console.error('Khalti SDK not loaded');
    return;
  }

  const khaltiConfig = {
    publicKey: config.publicKey || publicKey,
    productIdentity: config.productIdentity,
    productName: config.productName,
    productUrl: config.productUrl || window.location.origin,
    eventHandler: {
      onSuccess: (payload: any) => {
        console.log('Khalti payment success:', payload);
        config.onSuccess(payload);
      },
      onError: (error: any) => {
        console.log('Khalti payment error:', error);
        config.onError(error);
      },
      onClose: () => {
        console.log('Khalti widget closed');
      },
    },
    paymentPreference: [
      'KHALTI',
      'EBANKING',
      'MOBILE_BANKING',
      'CONNECT_IPS',
      'SCT',
    ],
  };

  const checkout = new (window as any).KhaltiCheckout(khaltiConfig);
  checkout.show({ amount: config.amount * 100 }); // Amount in paisa (Rs * 100)
}

/**
 * Verify Khalti payment
 */
export async function verifyKhaltiPayment(
  token: string,
  amount: number
): Promise<KhaltiPaymentResponse> {
  try {
    // This should be done through Cloud Functions for security
    // For now, we'll return a mock response
    return {
      status: 'success',
      token,
      amount,
      idx: `KHALTI${Date.now()}`,
    };
  } catch (error) {
    console.error('Khalti verification error:', error);
    return { status: 'failed' };
  }
}

/**
 * Mock Khalti payment for development
 */
export function mockKhaltiPayment(
  amount: number,
  productIdentity: string,
  successCallback: (response: KhaltiPaymentResponse) => void
): void {
  // Simulate payment processing
  setTimeout(() => {
    const response: KhaltiPaymentResponse = {
      status: 'success',
      token: `khalti_token_${Date.now()}`,
      amount,
      idx: productIdentity,
    };
    successCallback(response);
  }, 2000);
}

// ===================================
// GENERIC PAYMENT FUNCTIONS
// ===================================

/**
 * Process payment based on selected method
 */
export function processPayment(
  method: 'esewa' | 'khalti',
  config: {
    amount: number;
    transactionId: string;
    productName: string;
    onSuccess: (response: any) => void;
    onError: (error: any) => void;
  }
): void {
  const { amount, transactionId, productName, onSuccess, onError } = config;

  if (method === 'esewa') {
    // Use mock for development
    mockEsewaPayment(amount, transactionId, onSuccess);

    // Uncomment for production
    // initEsewaPayment({
    //   amount,
    //   transactionId,
    //   productName,
    //   successUrl: `${window.location.origin}/payment/success?method=esewa`,
    //   failureUrl: `${window.location.origin}/payment/failed?method=esewa`,
    // });
  } else if (method === 'khalti') {
    // Use mock for development
    mockKhaltiPayment(amount, transactionId, onSuccess);

    // Uncomment for production
    // initKhaltiPayment({
    //   publicKey: 'YOUR_KHALTI_PUBLIC_KEY',
    //   amount,
    //   productIdentity: transactionId,
    //   productName,
    //   onSuccess,
    //   onError,
    // });
  }
}
