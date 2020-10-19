const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.get('/donateMoney', (req,res)=>{
    res.render('donate.hbs', {stripePublicKey: process.env.STRIPE_PUBLIC_KEY});
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
        console.log(`Transaction successful for donation of Rs. ${amount} from ${req.body.donorName}`);
        return res.status(200).json({"message":"successful"});
    }).catch(()=>{
        console.log(`Something went wrong while receiving donation of Rs. ${amount} from ${req.body.donorName}`);
        return res.status(500).end();
    });
})

module.exports = router;