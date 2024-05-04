// import '@babel/polyfill';
import { login } from './login';
import { displayMap } from './leaflet';
import { logout } from './login';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
import { showAlert } from './alerts';

//Dom Elements
const leaflet =document.querySelector('#map');
const loginForm = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.querySelector('#book-tour');

//Delegations
if(leaflet){
    const locations = JSON.parse(leaflet.dataset.locations);
    displayMap(locations);
}

if(loginForm){
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        //Dom Values
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });
}

if(logout){
    logoutBtn.addEventListener('click', logout)
}

if (userDataForm) {
    userDataForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        //- Creating a multipart form data to send images and other data to the server to be updated
        const form = new FormData();
        form.append('name',  document.querySelector('#name').value)
        form.append('email',  document.querySelector('#email').value)
        form.append('photo',  document.querySelector('#photo').files[0])
        updateSettings(form, 'data');
                
        //Dom Values in case of no photo updated
        // const name =  document.querySelector('#name').value;
        // const email =  document.querySelector('#email').value;
        // updateSettings({name, email}, 'data');

    });
}

if (userPasswordForm) {
	userPasswordForm.addEventListener('submit', async (e) => {
		e.preventDefault();
		document.querySelector('.btn--save-password').textContent = 'Updating...';

		//Dom Values
		const currentPassword = document.querySelector('#password-current').value;
		const newPassword = document.querySelector('#password').value;
		const confirmNewPassword = document.querySelector('#password-confirm').value;

		await updateSettings(
			{ currentPassword, newPassword, confirmNewPassword },
			'password',
		);
		document.querySelector('#password-current').value = '';
		document.querySelector('#password').value = '';
		document.querySelector('#password-confirm').value = '';
        document.querySelector('.btn--save-password').textContent = 'SAVE PASSWORD';

	});
}

if (bookBtn) {
    bookBtn.addEventListener('click', e =>{
        e.target.textContent = 'Proccessing...';
        const {tourId} = e.target.dataset;
        bookTour(tourId);
    })
}

const alertMessage = document.querySelector('body').dataset.alert;

if (alert) {
    showAlert('success', alertMessage, 10);
}