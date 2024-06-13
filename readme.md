# Natours
  ![Natours Icon](https://github.com/MustafaAhmad216/Natours/blob/master/public/img/logo-green-round.png)

An awesome tour booking site built on top of NodeJS.

Demo • Key Features • Demonstration • How To Use • API Usage • Deployment • Build With • To-do • Installation • Known Bugs • Future Updates • Acknowledgement 


## Key Features 

- **Authentication and Authorization**
  - Sign up, Log in, Logout, Update, and reset password.
  - User profile management.
  - Roles: regular user, admin, lead guide, guide.

- **Tour Management**
  - Booking tours, checking tour maps, user reviews, and ratings.
  - Admins and lead-guides can create, update, and delete tours.

- **Booking Management**
  - Regular users can book and manage their tours.
  - Admins and lead guides have full control over bookings.

- **Review Management**
  - Regular users can write, edit, and delete reviews.
  - Admins can delete any review.

- **Credit Card Payment**
  - Users can bay with any credit card company.

## Demonstration

#### Home Page :
![Home Page](https://github.com/MustafaAhmad216/Natours/blob/master/public/img/Natours%20App%20Screens/Home%20Screen.gif)
#### Tour Details :
![Tour Details](https://github.com/MustafaAhmad216/Natours/blob/master/public/img/Natours%20App%20Screens/TourDetails.gif)

#### Payment Process :
![Payment Process](https://github.com/MustafaAhmad216/Natours/blob/master/public/img/Natours%20App%20Screens/PaymentProcess.gif)

#### Booked Tours :
![Booked Tours](https://github.com/MustafaAhmad216/Natours/blob/master/public/img/Natours%20App%20Screens/BookedTours.gif)

#### User Profile :
![User Profile](https://github.com/MustafaAhmad216/Natours/blob/master/public/img/Natours%20App%20Screens/UserProfile.gif)

#### Admin Profile :
![Admin Profile](https://github.com/MustafaAhmad216/Natours/blob/master/public/img/Natours%20App%20Screens/AdminProfile.gif)

## How To Use

### Book a tour

- Sign Up to the site
- Search for tours
- Book a tour and proceed to payment checkout

### Manage your booking

- Check the "Manage Booking" page in your user settings.

### Update your profile

- Update username, profile photo, email, and password.

## API Usage

- Set environment variables in Postman for development or production.
- Check [Natours API Documentation](https://blue-crescent-761148.postman.co/workspace/My-Workspace~86229287-9fcd-4ccb-847f-b0b5a41ae131/collection/23354036-25aa5950-3103-4220-8d01-e61fd541a509?action=share&source=copy-link&creator=23354036).

## Deployment

- Deploy with Render:
```bash
git init
git add -A
git commit -m "Commit message"
parcel build ./public/js/index.js --out-dir ./public/js --out-file bundle.js
```

Follow instructions on this link:
https://www.freecodecamp.org/news/how-to-deploy-nodejs-application-with-render

And Make Sure to:
  1-In Render for start command use node server.js and for build command and leave npm install or change yarn to it
  
  2-config.env file you should copy to Render secret file, render will by default SET NOD_ENV to production, there is no need to change anything in env file
OR 
  2-pass the Enviroment Variables that's in config.env file manually in options if Render Secret file didn't find the port
  
  3-Region (EU) as it's the same to that in mongodb
  
-------------------------------------------------------------------------------------------------------------------------------------------------

## Built With

- [NodeJS](https://nodejs.org)
- [Express](https://expressjs.com)
- [Mongoose](https://mongoosejs.com)
- [MongoDB Atlas](https://www.mongodb.com)
- [Pug](https://pugjs.org)
- [JSON Web Token](https://jwt.io)
- [ParcelJS](https://parceljs.org)
- [Stripe](https://stripe.com)
- [Postman](https://www.getpostman.com)
- [Mailtrap](https://mailtrap.io)
- [Sendgrid](https://sendgrid.com)
- [Heroku](https://www.heroku.com)
- [Mapbox](https://www.mapbox.com)

## To-do

- Review and rating improvements
- Advanced authentication features
- Enable PWA
- UX/UI improvements

## Setting Up Your Local Environment

1. Clone the repo.
2. Navigate to the repo.
3. Install dependencies from `package.json`.
4. Set up accounts for MongoDB, Mapbox, Stripe, Sendgrid, Mailtrap.
5. Set environment variables in `.env` file.

## Installation

1. Fork or clone the app.
2. Install dependencies:
    ```bash
    npm i
    ```
3. Set environment variables.
4. Run:
    ```bash
    npm run watch:js
    npm run build:js
    npm run dev (for development)
    npm run start:prod (for production)
    npm run debug (for debug)
    npm start
    ```
5. Set up ESLint and Prettier in VS Code:
    ```bash
    npm i eslint prettier eslint-config-prettier eslint-plugin-prettier eslint-config-airbnb eslint-plugin-node eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-react --save-dev
    ```

## Contributing

Pull requests are welcome. Please open an issue to discuss changes before making them.

## Known Bugs

Email [Mustafa Ahmad](Mustafaahmad21666@gmail.com) for issues or questions.

## Future Updates

- Enable PWA
- Improve UX/UI
- Featured Tours
- Recently Viewed Tours

## License

This project is open-sourced under the [MIT license](https://opensource.org/licenses/MIT).

## Deployed Version

Natours Live demo: [https://natours-hclr.onrender.com/](https://natours-hclr.onrender.com/)
