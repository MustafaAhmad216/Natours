const nodemailer = require('nodemailer');
const pug = require('pug');
const {htmlToText} = require('html-to-text');

/********************************************************************/
module.exports = class Email {
	constructor(user, url) {
		this.to = user.email;
		this.firstName = user.name.split(' ')[0];
		this.url = url;
		this.from = `Tawfik Ahmad <${process.env.EMAIL_FROM}>`;
	}

	newTransport() {
		if (process.env.NODE_ENV === 'production') {
			//SendGrid transporter
			return nodemailer.createTransport({
				//Get all data from SMTP & API on brevo.com
				host: process.env.BREVO_HOST,
				port: process.env.BREVO_PORT,
				auth: {
					user: process.env.BREVO_LOGIN,
					pass: process.env.BREVO_SMTP_KEY,
                },
			});
		}
		return nodemailer.createTransport({
			//Get all data from mailtrap.io inbox credentials
			host: process.env.EMAIL_HOST,
			port: process.env.EMAIL_PORT,
			secure: false,
			auth: {
				user: process.env.EMAIL_USERNAME,
				pass: process.env.EMAIL_PASSWORD,
			},
		});
	}

    //Send Actual Email
    async send(template, subject){
        //1) Render html based on the pug template
        const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject,
        })        

        //2) Define Email Options
        const mailOptions= {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText(html),
        };

        //3) Create a Transport and send Email
        await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome(){
        await this.send("Welcome", "Welcome to Natours Family!");
    }
    async sendPasswordReset(){
        await this.send("passwordReset", "Token sent to your email is only valid for 10 minutes!");
    }
};



// TRANSPORTER FOR GMAIL
// const transporter = nodemailer.createTransport({
//     service: "Gmail",
//     auth: {
//         user: process.env.EMAIL_USERNAME,
//         password: process.env.EMAIL_PASSWORD,
//     }
//     // Active in Gmail "less secure app" options
// })