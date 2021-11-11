import { showAlert } from './alert';

const stripe = Stripe(
  'pk_test_51JiZKPSIViyrVC1OqDlo9myqvQbV7Jyi9WhIFEEEtK9XTQho0uR3QngDRAlUbmIR0bgmPiHryyJJ1kW0oRxbz6jZ00bQQOy64O'
);

export const orderProduct = async (productIds) => {
  try {
    // 1. Get checkout session from server
    const session = await axios({
      method: 'POST',
      url: `/api/v1/bookings/checkout-session`,
      data: { productIds },
    });
    //   2. Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (error) {
    console.log(error);
    showAlert('error', error.response.data.message);
  }
};
