const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SEND_GRID_KEY);

const defaultSubject = "Blood quest admin here !";
const defaultBody = "Hope you're day is going good. Donate some blood, it might just get better";

const mailto = async (toAddress, subject, body = defaultBody) =>{
    if(!toAddress)
        return;
    if(!subject)
        subject = defaultSubject;
    try{
        await sgMail.send({
            from: process.env.MY_MAIL_AUTHENTICATED,
            to: toAddress,
            subject: subject,
            text: body
        })
    }catch(error){
        throw error;
    };
}



const confirmEmail = async(email, verificationToken)=>{
    try{
        let subject = "Verify your account at Blood Quest";

        let body = `Verify your account at Blood Quest using this link: \n ${process.env.BASE_URL}/auth/verify?token=${verificationToken}`;
        console.log(email, body);
        await mailto(email, subject, body);

    }catch(error){
        throw error;
    }
}

const requestBlood = async (donors, demandeeDetails) => {
    donors.people.forEach(donor => {
        let subject = `Blood request from ${demandeeDetails.name}`

        let body = `Hi ${donor.firstName} \n ${demandeeDetails.description} \n Our client, ${demandeeDetails.name} is in need of blood of type ${demandeeDetails.bloodType} \n Your blood is compatible to be donated to him, Please take a step and make someone's day :)`

        try{
            // await mailto(donor.email, subject, body);
        }catch(error){
            throw error;
        }
    });
    console.log("If you see this, mailer is not enabled !");
}


module.exports = {mailto, requestBlood, confirmEmail};