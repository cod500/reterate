
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const resetPasswordEmail = (email, token) => {
    sgMail.send({
        to: email,
        from: 'cod5000@gmail.com',
        subject: 'Restaurate Password Reset',
        text: 'You have requested for password reset. \n\n' +
            'Please click on the link to complete the process: \n\n' +
            'http://localhost:3000/reset/' + token + '\n\n'
    });
}

module.exports = resetPasswordEmail;
