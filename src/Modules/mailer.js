const request = require('request');
const sgMail = require('@sendgrid/mail');
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


const contactMessage = async(email, name, body) =>{
    try{
        let subjectForMail = `From ${name}(${email}) -BloodQuest contact form`;
        let wpMessage = "From: " + name + 
                    "\n Email: " + email + 
                    "\n\n " + body;
        let whatsappUrl = "https://api.callmebot.com/whatsapp.php?phone="+process.env.MY_PHONE+"&text="+wpMessage+"&apikey="+process.env.MSG_KEY;

        request.get({url: whatsappUrl, proxy: ''}, (error, response)=>{
            if(error)
                throw new Error("Couldn't send whatsapp message!");
            console.log(response.statusCode,response.statusMessage);
        });
        mailto(process.env.MY_MAIL_FOR_CONTACT, subjectForMail, body, ()=>{});
    }catch(error){
        console.log("Error in contact me",error);
    }
}
// contactMessage("omkarpha@gmail.com", "Random person", "testing body");

const confirmEmail = async(email, verificationToken)=>{
    try{
        let subject = "Verify your account at Blood Quest";

        let body = `Verify your account at Blood Quest using this link: \n ${process.env.BASE_URL}/auth/verify?token=${verificationToken}`;
        await mailto(email, subject, body);

    }catch(error){
        throw error;
    }
}

const requestBlood = async (donors, demandeeDetails) => {
    donors.people.forEach(donor => {
        let subject = `Blood request from ${demandeeDetails.name}`

        let body = `Hi ${donor.firstName}  
Our client, ${demandeeDetails.name} is in need of blood of type ${demandeeDetails.bloodType}  
Your blood is compatible to be donated to him, Please take a step and save someone's life :) 
Details of needie:  
Name: ${demandeeDetails.name}, Age: ${demandeeDetails.age}
Hospital Address: ${demandeeDetails.address}, ${demandeeDetails.state}, ${demandeeDetails.district}
Contact: ${demandeeDetails.phone} / ${demandeeDetails.whatsapp}(Whatsapp)
Email: ${demandeeDetails.email}
Needies words:
${demandeeDetails.description}  `

        console.log(body);
        try{
            mailto(donor.email, subject, body);
        }catch(error){
            throw error;
        }
    });
}


module.exports = {mailto, requestBlood, confirmEmail, contactMessage};