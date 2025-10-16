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

  const isFormComplete = () => {
    return cardComplete.cardNumber && 
           cardComplete.cardExpiry && 
           cardComplete.cardCvc && 
           billingDetails.name.trim() &&
           billingDetails.email.trim() &&
           billingDetails.phone.trim() &&
           !processing;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements || processing) {
      return;
    }

    if (!isFormComplete()) {
      setCardError('Please complete all required fields');
      return;
    }

    setProcessing(true);
    setCardError(null);

    try {
      console.log('Creating payment intent for healthcare professional appointment...');
      
      // Convert LKR to cents (LKR uses 2 decimal places, so multiply by 100)
      const amountInCents = Math.round(parseFloat(amount) * 100);
      
      // Create payment intent on your server - matching doctor payment format
      const response = await elderApi.createPaymentIntent({
        amount: amountInCents,
        currency: 'lkr',
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
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className={styles.paymentForm}>
      <div className={styles.billingSection}>
        <h3>Billing Information</h3>
        
        <div className={styles.inputGroup}>
          <label htmlFor="name">Full Name *</label>
          <input
            type="text"
            id="name"
            value={billingDetails.name}
            onChange={(e) => setBillingDetails(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            value={billingDetails.email}
            onChange={(e) => setBillingDetails(prev => ({ ...prev, email: e.target.value }))}
            placeholder="Enter your email address"
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="phone">Phone Number *</label>
          <input
            type="tel"
            id="phone"
            value={billingDetails.phone}
            onChange={(e) => setBillingDetails(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="Enter your phone number"
            required
          />
        </div>
      </div>

      <div className={styles.cardSection}>
        <h3>Card Information</h3>
        
        <div className={styles.cardElement}>
          <label>Card Number *</label>
          <div className={styles.stripeElement}>
            <CardNumberElement 
              options={cardElementOptions}
              onChange={handleCardChange('cardNumber')}
            />
          </div>
        </div>

        <div className={styles.cardRow}>
          <div className={styles.cardElement}>
            <label>Expiry Date *</label>
            <div className={styles.stripeElement}>
              <CardExpiryElement 
                options={cardElementOptions}
                onChange={handleCardChange('cardExpiry')}
              />
            </div>
          </div>

          <div className={styles.cardElement}>
            <label>CVC *</label>
            <div className={styles.stripeElement}>
              <CardCvcElement 
                options={cardElementOptions}
                onChange={handleCardChange('cardCvc')}
              />
            </div>
          </div>
        </div>

        {cardError && (
          <div className={styles.errorMessage}>
            {cardError}
          </div>
        )}
      </div>

      <div className={styles.paymentSummary}>
        <div className={styles.summaryRow}>
          <span>Healthcare Professional Consultation</span>
          <span>Rs. {amount.toLocaleString()}</span>
        </div>
        <div className={styles.summaryRow + ' ' + styles.total}>
          <strong>Total Amount</strong>
          <strong>Rs. {amount.toLocaleString()}</strong>
        </div>
      </div>

      <button 
        type="submit" 
        disabled={!isFormComplete()}
        className={`${styles.payButton} ${!isFormComplete() ? styles.disabled : ''}`}
      >
        {processing ? (
          <div className={styles.processingSpinner}>
            <div className={styles.spinner}></div>
            Processing Payment...
          </div>
        ) : (
          `Pay Rs. ${amount.toLocaleString()}`
        )}
      </button>
    </form>
  );
};

const HealthcarePayment = () => {
  const { currentUser, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get payment details from URL params
  const tempBookingId = searchParams.get('tempBookingId');
  const elderId = searchParams.get('elderId');
  const counselorId = searchParams.get('counselorId');
  const appointmentDate = searchParams.get('appointmentDate');
  const appointmentTime = searchParams.get('appointmentTime');
  const appointmentType = searchParams.get('appointmentType');
  const amount = parseFloat(searchParams.get('amount'));
  const counselorName = searchParams.get('counselorName');
  const elderName = searchParams.get('elderName');

  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [timerExpired, setTimerExpired] = useState(false);

  // Booking data for payment processing (matching doctor format for consistency)
  const bookingData = {
    tempBookingId,
    elderId,
    counselorId, // Healthcare professional ID
    doctorId: null, // For compatibility with payment route
    appointmentDate,
    appointmentTime,
    appointmentType,
    counselorName,
    doctorName: counselorName, // Alias for payment route compatibility
    elderName,
    provider: 'healthcare' // Identifier for healthcare professional appointments
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
          // For new bookings, set timer to 10 minutes
          console.log('Setting new timer for healthcare professional booking');
          const expiresAt = new Date().getTime() + (10 * 60 * 1000); // 10 minutes from now
          
          localStorage.setItem(timerKey, JSON.stringify({ expiresAt }));
          setTimeLeft(600); // 10 minutes
        }
      } catch (error) {
        console.error('Timer initialization error:', error);
        setTimeLeft(600); // Fallback to 10 minutes
      }
    };

    initializeTimer();
  }, [tempBookingId]);

  // Timer countdown effect
  useEffect(() => {
    if (timeLeft <= 0) {
      setTimerExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = Math.max(0, prev - 1);
        if (newTime === 0) {
          setTimerExpired(true);
          if (tempBookingId) {
            localStorage.removeItem(`payment_timer_${tempBookingId}`);
          }
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, tempBookingId]);

  // Authentication check
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  const handlePaymentSuccess = async (paymentData) => {
    try {
      setError(null);
      
      // Clean up localStorage on successful payment
      if (tempBookingId) {
        localStorage.removeItem(`payment_timer_${tempBookingId}`);
      }

      // Convert temporary booking to confirmed healthcare professional appointment
      const confirmationData = {
        tempBookingId,
        paymentMethod: 'card',
        paymentAmount: amount,
        transactionId: paymentData.transactionId,
        paymentIntentId: paymentData.paymentIntentId,
        paymentStatus: 'completed',
        billingDetails: paymentData.billingDetails
      };

      console.log('Confirming healthcare professional payment and creating appointment:', confirmationData);

      const response = await elderApi.confirmPaymentAndCreateHealthcareProfessionalAppointment(elderId, confirmationData);
      
      if (response.success) {
        // Redirect to success page
        const successParams = new URLSearchParams({
          appointmentId: response.appointment.appointment_id,
          elderId,
          counselorId,
          date: appointmentDate,
          time: appointmentTime,
          type: appointmentType,
          counselorName,
          elderName,
          amount,
          transactionId: confirmationData.transactionId,
          provider: 'healthcare'
        });

        navigate(`/family-member/healthcare-payment-success?${successParams.toString()}`);
      } else {
        throw new Error(response.error || 'Payment confirmation failed');
      }
      
    } catch (err) {
      console.error('Error confirming healthcare professional payment:', err);
      setError(err.message || 'Payment confirmation failed. Please contact support.');
    }
  };

  const handlePaymentError = (errorMessage) => {
    setError(errorMessage);
    setProcessing(false);
  };

  const handleTimerExpired = () => {
    navigate('/family-member/elder-doctors', { 
      state: { 
        message: 'Your payment session has expired. Please book again.' 
      }
    });
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <h2>Loading...</h2>
      </div>
    );
  }

  // Timer expired state
  if (timerExpired) {
    return (
      <FamilyMemberLayout>
        <div className={styles.container}>
          <div className={styles.expiredContainer}>
            <div className={styles.expiredIcon}>⏰</div>
            <h2>Payment Session Expired</h2>
            <p>Your healthcare professional appointment reservation has expired.</p>
            <p>Please book your appointment again to proceed with payment.</p>
            <button 
              onClick={handleTimerExpired}
              className={styles.returnButton}
            >
              Book New Appointment
            </button>
          </div>
        </div>
      </FamilyMemberLayout>
    );
  }

  // Missing required parameters
  if (!tempBookingId || !elderId || !counselorId || !amount) {
    return (
      <FamilyMemberLayout>
        <div className={styles.container}>
          <div className={styles.errorContainer}>
            <h2>Invalid Payment Session</h2>
            <p>Required payment information is missing. Please start the booking process again.</p>
            <button 
              onClick={() => navigate('/family-member/elder-doctors')}
              className={styles.returnButton}
            >
              Return to Appointments
            </button>
          </div>
        </div>
      </FamilyMemberLayout>
    );
  }

  return (
    <FamilyMemberLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Healthcare Professional Payment</h1>
          
          <div className={styles.timerContainer}>
            <div className={`${styles.timer} ${timeLeft <= 60 ? styles.timerWarning : ''}`}>
              <span className={styles.timerIcon}>⏰</span>
              <span>Time remaining: {formatTime(timeLeft)}</span>
            </div>
            <p className={styles.timerNote}>
              Complete your payment within the time limit to secure your appointment
            </p>
          </div>
        </div>

        <div className={styles.paymentContainer}>
          <div className={styles.appointmentSummary}>
            <h2>Appointment Details</h2>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryItem}>
                <strong>Patient:</strong>
                <span>{elderName}</span>
              </div>
              <div className={styles.summaryItem}>
                <strong>Healthcare Professional:</strong>
                <span>{counselorName}</span>
              </div>
              <div className={styles.summaryItem}>
                <strong>Date:</strong>
                <span>{new Date(appointmentDate).toLocaleDateString('en-GB', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              <div className={styles.summaryItem}>
                <strong>Time:</strong>
                <span>{appointmentTime}</span>
              </div>
              <div className={styles.summaryItem}>
                <strong>Type:</strong>
                <span className={styles.appointmentType}>
                  {appointmentType === 'physical' ? '🏥 Physical Consultation' : '💻 Online Consultation'}
                </span>
              </div>
              <div className={styles.summaryItem}>
                <strong>Amount:</strong>
                <span className={styles.amount}>Rs. {amount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className={styles.paymentSection}>
            <h2>Payment Information</h2>
            
            {error && (
              <div className={styles.errorAlert}>
                <div className={styles.errorIcon}>⚠️</div>
                <div>
                  <strong>Payment Error</strong>
                  <p>{error}</p>
                </div>
              </div>
            )}

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

        <div className={styles.securityInfo}>
          <div className={styles.securityIcon}>🔒</div>
          <div>
            <strong>Secure Payment</strong>
            <p>Your payment information is encrypted and secure. We use Stripe for processing payments.</p>
          </div>
        </div>
      </div>
    </FamilyMemberLayout>
  );
};

export default HealthcarePayment;