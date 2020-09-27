const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SEND_GRID_KEY);


const mailto = (toAddress, subject, body = "Hope you're day is going good. Donate some blood, it might just get better") =>{
    if(!toAddress)
        return;
    if(!subject)
        subject = "Blood quest admin here !";
    sgMail.send({
        from: process.env.MY_MAIL_AUTHENTICATED,
        to: toAddress,
        subject: subject,
        text: body
    }).then(() => "Done").catch((error) => {
        console.log('error', error);
        console.log(error)
    });
}

module.exports = mailto;