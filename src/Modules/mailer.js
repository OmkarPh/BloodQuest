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

const requestBlood = async (donors, demandeeDetails) => {
    
    donors.people.forEach(donor => {
        let subject = `Blood request from ${demandeeDetails.name}`

        let body = `Hi ${donor.firstName} \n ${demandeeDetails.description} \n Our client, ${demandeeDetails.name} is in need of blood of type ${demandeeDetails.bloodType} \n Your blood is compatible to be donated to him, Please take a step and make someone's day :)`

        // mailto(donor.email, subject, body);
    });
    
    console.log("If you see this, mailer is not enabled !");

}


module.exports = {mailto, requestBlood};