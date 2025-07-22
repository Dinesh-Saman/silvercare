import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { useAuth } from '../../context/AuthContext';
import { elderApi } from '../../services/elderApi';
import Navbar from '../../components/navbar';
import FamilyMemberLayout from '../../components/FamilyMemberLayout';
import styles from '../../components/css/familymember/payment.module.css';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const PaymentForm = ({ 
  amount, 
  onPaymentSuccess, 
  onPaymentError, 
  processing, 
  setProcessing,
  bookingData 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState(null);
  const [cardComplete, setCardComplete] = useState({
    cardNumber: false,
    cardExpiry: false,
    cardCvc: false
  });
  const [billingDetails, setBillingDetails] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const handleCardChange = (elementType) => (event) => {
    if (event.error) {
      setCardError(event.error.message);
    } else {
      setCardError(null);
    }
    
    setCardComplete(prev => ({
      ...prev,
      [elementType]: event.complete
    }));
  };

  const handleBillingChange = (e) => {
    setBillingDetails({
      ...billingDetails,
      [e.target.name]: e.target.value
    });
  };

  const isFormComplete = () => {
    return cardComplete.cardNumber && 
           cardComplete.cardExpiry && 
           cardComplete.cardCvc &&
           billingDetails.name && 
           billingDetails.email;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setCardError('Stripe has not loaded yet. Please try again.');
      return;
    }

    if (!isFormComplete()) {
      setCardError('Please complete all card information and billing details');
      return;
    }

    setProcessing(true);
    setCardError(null);

    try {
      console.log('Creating payment intent...');
      
      // Convert LKR to cents (LKR uses 2 decimal places, so multiply by 100)
      const amountInCents = Math.round(parseFloat(amount) * 100);
      
      // Create payment intent on your server
      const response = await elderApi.createPaymentIntent({
        amount: amountInCents,
        currency: 'lkr', // Sri Lankan Rupees
        bookingData,
        billingDetails
      });

      console.log('Payment intent response:', response);

      if (!response.success) {
        throw new Error(response.error || 'Failed to create payment intent');
      }

      const { client_secret } = response;

      console.log('Confirming payment...');

      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: elements.getElement(CardNumberElement),
          billing_details: {
            name: billingDetails.name,
            email: billingDetails.email,
            phone: billingDetails.phone,
          },
        },
      });

      if (error) {
        console.error('Payment failed:', error);
        onPaymentError(error.message);
      } else if (paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded:', paymentIntent);
        onPaymentSuccess({
          paymentIntentId: paymentIntent.id,
          transactionId: paymentIntent.id,
          paymentMethod: 'card',
          paymentAmount: amount,
          paymentStatus: 'completed',
          billingDetails
        });
      }
    } catch (err) {
      console.error('Payment processing error:', err);
      onPaymentError(err.message || 'Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className={styles.paymentForm}>
      {/* Billing Details */}
      <div className={styles.billingSection}>
        <h3>💳 Billing Information</h3>
        <div className={styles.billingGrid}>
          <div className={styles.inputGroup}>
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={billingDetails.name}
              onChange={handleBillingChange}
              placeholder="Enter cardholder name"
              required
              className={styles.input}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={billingDetails.email}
              onChange={handleBillingChange}
              placeholder="Enter email address"
              required
              className={styles.input}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={billingDetails.phone}
              onChange={handleBillingChange}
              placeholder="Enter phone number (+94XXXXXXXXX)"
              className={styles.input}
            />
          </div>
        </div>
      </div>

      {/* Card Details */}
      <div className={styles.cardSection}>
        <h3>💳 Card Information</h3>
        
        {/* Card Number */}
        <div className={styles.cardInputGroup}>
          <label>Card Number *</label>
          <div className={styles.cardElementContainer}>
            <CardNumberElement
              options={cardElementOptions}
              onChange={handleCardChange('cardNumber')}
            />
          </div>
        </div>

        {/* Expiry and CVC */}
        <div className={styles.cardRow}>
          <div className={styles.cardInputGroup}>
            <label>Expiry Date *</label>
            <div className={styles.cardElementContainer}>
              <CardExpiryElement
                options={cardElementOptions}
                onChange={handleCardChange('cardExpiry')}
              />
            </div>
          </div>
          <div className={styles.cardInputGroup}>
            <label>CVC *</label>
            <div className={styles.cardElementContainer}>
              <CardCvcElement
                options={cardElementOptions}
                onChange={handleCardChange('cardCvc')}
              />
            </div>
          </div>
        </div>

        {cardError && (
          <div className={styles.cardError}>
            <span className={styles.errorIcon}>⚠️</span>
            {cardError}
          </div>
        )}
      </div>

      {/* Accepted Cards */}
      <div className={styles.acceptedCards}>
        <span>Accepted cards:</span>
        <div className={styles.cardLogos}>
          <span className={styles.cardLogo}>💳 Visa</span>
          <span className={styles.cardLogo}>💳 Mastercard</span>
          <span className={styles.cardLogo}>💳 Amex</span>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className={styles.payButton}
        disabled={!stripe || processing || !isFormComplete()}
      >
        {processing ? (
          <>
            <div className={styles.buttonSpinner}></div>
            Processing Payment...
          </>
        ) : (
          `Pay Rs. ${amount}`
        )}
      </button>
    </form>
  );
};

const Payment = () => {
  const { currentUser, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get payment details from URL params
  const tempBookingId = searchParams.get('tempBookingId');
  const elderId = searchParams.get('elderId');
  const doctorId = searchParams.get('doctorId');
  const appointmentDate = searchParams.get('date');
  const appointmentTime = searchParams.get('time');
  const appointmentType = searchParams.get('type');
  const amount = searchParams.get('amount');
  const doctorName = searchParams.get('doctorName');
  const elderName = searchParams.get('elderName');

  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [timerExpired, setTimerExpired] = useState(false);

  // Booking data for payment processing
  const bookingData = {
    tempBookingId,
    elderId,
    doctorId,
    appointmentDate,
    appointmentTime,
    appointmentType,
    doctorName,
    elderName
  };

  // Initialize timer based on localStorage or fetch from server
  useEffect(() => {
    const initializeTimer = async () => {
      if (!tempBookingId) return;

      const timerKey = `payment_timer_${tempBookingId}`;
      const storedTimerData = localStorage.getItem(timerKey);

      try {
        if (storedTimerData) {
          // Use stored timer data
          const { expiresAt } = JSON.parse(storedTimerData);
          const now = new Date().getTime();
          const remainingTime = Math.max(0, Math.floor((expiresAt - now) / 1000));
          
          console.log('Timer restored from localStorage:', {
            expiresAt: new Date(expiresAt),
            now: new Date(now),
            remainingTime
          });

          if (remainingTime <= 0) {
            setTimerExpired(true);
            localStorage.removeItem(timerKey);
            return;
          }

          setTimeLeft(remainingTime);
        } else {
          // Fetch timer data from server (temporary booking info)
          try {
            const response = await elderApi.getTemporaryBooking(tempBookingId);
            
            if (response.success && response.tempBooking) {
              const expiresAt = new Date(response.tempBooking.expires_at).getTime();
              const now = new Date().getTime();
              const remainingTime = Math.max(0, Math.floor((expiresAt - now) / 1000));
              
              console.log('Timer initialized from server:', {
                expiresAt: new Date(expiresAt),
                now: new Date(now),
                remainingTime
              });

              if (remainingTime <= 0) {
                setTimerExpired(true);
                return;
              }

              // Store in localStorage for future page reloads
              localStorage.setItem(timerKey, JSON.stringify({ expiresAt }));
              setTimeLeft(remainingTime);
            } else {
              // Temporary booking not found or expired
              setTimerExpired(true);
            }
          } catch (err) {
            console.error('Error fetching temporary booking:', err);
            // Fallback to default timer if server request fails
            const expiresAt = new Date().getTime() + (10 * 60 * 1000); // 10 minutes from now
            localStorage.setItem(timerKey, JSON.stringify({ expiresAt }));
            setTimeLeft(600);
          }
        }
      } catch (err) {
        console.error('Error initializing timer:', err);
        // Fallback to default timer
        const expiresAt = new Date().getTime() + (10 * 60 * 1000);
        localStorage.setItem(timerKey, JSON.stringify({ expiresAt }));
        setTimeLeft(600);
      }
    };

    initializeTimer();
  }, [tempBookingId]);

  // Countdown timer
  useEffect(() => {
    if (timerExpired) return;

    if (timeLeft <= 0) {
      setTimerExpired(true);
      // Clean up localStorage
      if (tempBookingId) {
        localStorage.removeItem(`payment_timer_${tempBookingId}`);
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        
        // Update localStorage every 10 seconds to keep it fresh
        if (newTime % 10 === 0 && tempBookingId) {
          const timerKey = `payment_timer_${tempBookingId}`;
          const expiresAt = new Date().getTime() + (newTime * 1000);
          localStorage.setItem(timerKey, JSON.stringify({ expiresAt }));
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, timerExpired, tempBookingId]);

  // Handle timer expiration
  useEffect(() => {
    if (timerExpired) {
      // Clean up localStorage
      if (tempBookingId) {
        localStorage.removeItem(`payment_timer_${tempBookingId}`);
      }
      
      // Redirect after a short delay to show the expiration message
      const redirectTimer = setTimeout(() => {
        navigate(`/family-member/elder/${elderId}/doctors`, { 
          replace: true,
          state: { message: 'Payment time expired. Please try booking again.' }
        });
      }, 3000);

      return () => clearTimeout(redirectTimer);
    }
  }, [timerExpired, navigate, elderId, tempBookingId]);

  // Protect the route
  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated || !currentUser) {
      navigate('/login', { replace: true });
      return;
    }

    if (currentUser.role !== 'family_member') {
      navigate('/login', { replace: true });
      return;
    }

    // Validate required params
    if (!tempBookingId || !elderId || !doctorId || !appointmentDate || !appointmentTime) {
      navigate(`/family-member/elder/${elderId}/doctors`, { replace: true });
      return;
    }
  }, [currentUser, isAuthenticated, loading, navigate, tempBookingId, elderId, doctorId, appointmentDate, appointmentTime]);

  // Format countdown time
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
       const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    
    const [year, month, day] = dateString.split('-');
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const dayOfWeek = dayNames[date.getDay()];
    
    return `${dayOfWeek}, ${monthNames[parseInt(month) - 1]} ${parseInt(day)}, ${year}`;
  };

  // Format time for display
  const formatTimeForDisplay = (timeString) => {
    if (!timeString) return '';
    
    const [hours, minutes] = timeString.split(':');
    const hour12 = parseInt(hours) > 12 ? parseInt(hours) - 12 : parseInt(hours);
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
    const displayHour = hour12 === 0 ? 12 : hour12;
    
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handlePaymentSuccess = async (paymentData) => {
    try {
      setError(null);
      
      // Clean up localStorage on successful payment
      if (tempBookingId) {
        localStorage.removeItem(`payment_timer_${tempBookingId}`);
      }

      // Convert temporary booking to confirmed appointment
      const confirmationData = {
        tempBookingId,
        paymentMethod: 'card',
        paymentAmount: amount,
        transactionId: paymentData.transactionId,
        paymentIntentId: paymentData.paymentIntentId,
        paymentStatus: 'completed',
        billingDetails: paymentData.billingDetails
      };

      console.log('Confirming payment and creating appointment:', confirmationData);

      const response = await elderApi.confirmPaymentAndCreateAppointment(elderId, confirmationData);
      
      if (response.success) {
        // Redirect to success page
        const successParams = new URLSearchParams({
          appointmentId: response.appointment.appointment_id,
          elderId,
          doctorId,
          date: appointmentDate,
          time: appointmentTime,
          type: appointmentType,
          doctorName,
          elderName,
          amount,
          transactionId: confirmationData.transactionId
        });

        navigate(`/family-member/payment-success?${successParams.toString()}`);
      } else {
        throw new Error(response.error || 'Payment confirmation failed');
      }
      
    } catch (err) {
      console.error('Error confirming payment:', err);
      setError(err.message || 'Payment confirmation failed. Please contact support.');
    }
  };

  const handlePaymentError = (errorMessage) => {
    console.error('Payment error:', errorMessage);
    setError(errorMessage);
  };

  const handleCancel = async () => {
    try {
      if (tempBookingId) {
        // Clean up localStorage
        localStorage.removeItem(`payment_timer_${tempBookingId}`);
        
        // Cancel temporary booking
        await elderApi.cancelTemporaryBooking(tempBookingId);
      }
      
      navigate(`/family-member/elder/${elderId}/doctors`);
    } catch (err) {
      console.error('Error canceling booking:', err);
      // Still redirect back even if cancellation fails
      navigate(`/family-member/elder/${elderId}/doctors`);
    }
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className={styles.container}>
        <Navbar />
        <FamilyMemberLayout>
          <div className={styles.content}>
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <h2>Loading payment page...</h2>
            </div>
          </div>
        </FamilyMemberLayout>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated || !currentUser || currentUser.role !== 'family_member') {
    return (
      <div className={styles.accessDenied}>
        <h2>Access Denied</h2>
        <p>Redirecting to login...</p>
      </div>
    );
  }

  // Show timer expired message
  if (timerExpired) {
    return (
      <div className={styles.container}>
        <Navbar />
        <FamilyMemberLayout>
          <div className={styles.content}>
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <h2>⏰ Payment Time Expired</h2>
              <p>Your booking slot has expired. Redirecting to book a new appointment...</p>
            </div>
          </div>
        </FamilyMemberLayout>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Navbar />
      <FamilyMemberLayout>
        <div className={styles.content}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerContent}>
              <h1 className={styles.title}>💳 Complete Payment</h1>
              <p className={styles.subtitle}>
                Secure payment for your appointment booking
              </p>
            </div>
            <div className={styles.timerContainer}>
              <div className={styles.timer}>
                <span className={styles.timerIcon}>⏱️</span>
                <span className={styles.timerText}>Time remaining:</span>
                <span className={`${styles.timerValue} ${timeLeft <= 60 ? styles.timerCritical : ''}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className={styles.errorMessage}>
              <span className={styles.errorIcon}>⚠️</span>
              {error}
            </div>
          )}

          <div className={styles.paymentContainer}>
            {/* Booking Summary */}
            <div className={styles.bookingSummary}>
              <h2>📋 Booking Summary</h2>
              <div className={styles.summaryDetails}>
                <div className={styles.summaryRow}>
                  <span className={styles.label}>Patient:</span>
                  <span className={styles.value}>{elderName}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.label}>Doctor:</span>
                  <span className={styles.value}>{doctorName}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.label}>Date:</span>
                  <span className={styles.value}>{formatDateForDisplay(appointmentDate)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.label}>Time:</span>
                  <span className={styles.value}>{formatTimeForDisplay(appointmentTime)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.label}>Type:</span>
                  <span className={styles.value}>
                    {appointmentType === 'physical' ? '🏥 Physical' : '💻 Online'} Appointment
                  </span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.label}>Duration:</span>
                  <span className={styles.value}>
                    {appointmentType === 'physical' ? '2 hours' : '1 hour'}
                  </span>
                </div>
                <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                  <span className={styles.label}>Total Amount:</span>
                  <span className={styles.value}>Rs. {amount}</span>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div className={styles.paymentSection}>
              <h2>💳 Payment Details</h2>
              <Elements stripe={stripePromise}>
                <PaymentForm
                  amount={amount}
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentError={handlePaymentError}
                  processing={processing}
                  setProcessing={setProcessing}
                  bookingData={bookingData}
                />
              </Elements>
            </div>
          </div>

          {/* Security Notice */}
          <div className={styles.securityNotice}>
            <div className={styles.securityIcon}>🔒</div>
            <div className={styles.securityContent}>
              <h3>Secure Payment</h3>
              <p>Your payment information is encrypted and secure. We use Stripe for payment processing and do not store your card details.</p>
            </div>
          </div>

          {/* Cancel Button */}
          <div className={styles.cancelSection}>
            <button
              className={styles.cancelButton}
              onClick={handleCancel}
              disabled={processing}
            >
              Cancel Payment
            </button>
          </div>
        </div>
      </FamilyMemberLayout>
    </div>
  );
};

export default Payment;

