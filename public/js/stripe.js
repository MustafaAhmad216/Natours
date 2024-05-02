import axios from "axios";
import { showAlert } from "./alerts";

export const bookTour = async (tourId) => {
    const stripe = Stripe(
        'pk_test_51PBLffFUSeUK2VeVwICyikLg9OmdWl0lBO7EyVWmk7HOcAUmnpNnt1b2HqNa2ERvvYBU9xstjvsOB7GjfyB6ZHkd00TI84ouNP',
    );
	try {
		//1) get the checkout session from the API endpoint
		const session = await axios(
			`http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`,
		);
        
		//2) Use Stripe object to create checkout form + charge the credit card
        // await stripe.redirectToCheckout({
        //     sessionId: session.data.session.id,
        // });                      //DEPRECATED
        location.assign(session.data.session.url);
        
	} catch (error) {
        console.log(error);
        showAlert('error', error.message);
    }
};

// const session = await axios({
//     method: 'GET',
//     url: `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`,
// });