const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const {thankEmail} = require('./../Modules/mailer');

router.get('/donateMoney', (req,res)=>{
    let personalisation = {};
    if(req.isPersonalised)
        personalisation= {email: req.user.email, name: req.user.firstName};
    res.render('donate.hbs', {...personalisation, stripePublicKey: process.env.STRIPE_PUBLIC_KEY});
})

router.post('/processPayment', (req,res)=>{
    if(!req.body.donorName)
        req.body.donorName = "Unknown"
    console.log(req.body);
    let amount = req.body.donationAmount;
    stripe.charges.create({
        amount,
        source: req.body.stripeTokenId,
        currency: 'inr'
    }).then(()=>{
        console.log(`Transaction successful for donation of Rs. ${amount/100} from ${req.body.donorName}`);
        res.status(200).json({"message":"successful"});
        thankEmail(req.body.email, req.body.donorName);
    }).catch((err)=>{
        console.log(err)
        console.log(`Something went wrong while receiving donation of Rs. ${amount} from ${req.body.donorName}`);
        return res.status(500).end();
    });
})

module.exports = router;