const request = require('request');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SEND_GRID_KEY);

const defaultSubject = "Blood quest admin here !";
const defaultBody = "Hope you're day is going good. Donate some blood, it might just get better";

// Actual normal mail worker
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

// Actual templated mail worker
const templateMapping = new Map([
    ['confirmation', process.env.CONFIRMATION_TEMPLATE], 
    ['request', process.env.REQUEST_TEMPLATE]
]);
const templateKeys = Array.from(templateMapping.keys());
const mailTemplate = async (toAddress, templateType, dynamicTemplateData)=>{
    if(!toAddress || !templateType || !dynamicTemplateData)
        return false;
    if(!templateKeys.includes(templateType))
        return false;
    
    dynamicTemplateData.Sender_Name = "Blood Quest Admin";
    const msg = {
      to: toAddress,
      from: process.env.MY_MAIL_AUTHENTICATED,
      templateId: templateMapping.get(templateType),
      dynamicTemplateData
    };
    sgMail.send(msg);
}





// Utility for confirmation
const confirmEmail = async(email, verificationToken)=>{
    try{
        let verificationLink = `${process.env.BASE_URL}/auth/verify?token=${verificationToken}`;
        let denialLink = `${process.env.BASE_URL}/auth/deny?token=${verificationToken}`;

        await mailTemplate(email, 'confirmation', { verificationLink, denialLink } );
    }catch(error){
        throw error;
    }
}

// Utility for Blood request
const demandPageLink= `${process.env.BASE_URL}/request`;
const requestBlood = async (donors, demandeeDetails) => {
    donors.people.forEach(donor => {
        try{
            mailTemplate(donor.email, 'request', { donor, demandeeDetails, demandPageLink} );
        }catch(error){
            throw error;
        }
    });
}

// Utility for contact message
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

module.exports = {mailto, requestBlood, confirmEmail, contactMessage};