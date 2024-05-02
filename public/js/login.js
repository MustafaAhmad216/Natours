import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
	try {
		const res = await axios({
			method: 'POST',
			url: 'http://127.0.0.1:3000/api/v1/users/login',
			data: {
				email,
				password,
			},
		});
		if (res.data.status === 'Success') {
			showAlert('success', 'Logged In Successfully!😀');
			window.setTimeout(() => {
				console.log('DONE');
				location.assign('http://127.0.0.1:3000/');
			}, 2000);
		}
	} catch (err) {
		showAlert('error', err.response.data.message);
	}
};

export const logout = async () => {
	try {
		const res = await axios({
			method: 'GET',
			url: 'http://127.0.0.1:3000/api/v1/users/logout',
		});
		if (res.data.status === 'Success') {
			showAlert('success', 'Logged Out Successfully! 😔');
			window.setTimeout(() => {
				location.reload(true);
				location.assign('http://127.0.0.1:3000/');
			}, 1000);
		}
	} catch (err) {
		showAlert('error', "Error Logging Out! Try again");
	}
};
