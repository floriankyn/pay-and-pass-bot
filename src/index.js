//index.js// -- created by Florian Lepage 11/09/2020

// node.js imports
const fs = require("fs");
const time = date => `${new Date(date).getHours()}:${new Date(date).getMinutes()}:${new Date(date).getSeconds()}`;

// discord.js init
const discord = require("discord.js");
const client = new discord.Client({partials: ['MESSAGE', 'CHANNEL', 'REACTION']});

// json imports
const config = JSON.parse(fs.readFileSync("./config/config.json"));
const language = JSON.parse(fs.readFileSync("./language/en-US.json"));

// Database imports (Located to ./database/)
const {Database} = require("./database/Database.js");

// Class imports
const {StaffManager} = require("./action/administration/StaffManager.js");
const {Utils} = require("./action/everyone/Utils.js");
const {PrivateManager} = require("./action/moderation/PrivateManager.js");
const {PrivateStoreManager} = require("./action/everyone/PrivateStoreManager.js");

// Event imports

// Event calls

// Client events
client.on(`ready`, () => {
    console.log(`[${time(Date.now())}] The client "${client.user.tag}" has been connected.`); // Check if the client has been logged.
    new Database(config, time).checkConnectionState(); // Return if the client is connected to the database.
    new Database(config, time).tableCheckCreation();
});
client.on(`message`, (message) => {
    new StaffManager(message, config, language, client).selector();
    new Utils(message, config, language, client).selector();
    new PrivateManager(message, config, language, client).selector();
    new PrivateStoreManager(message, config, language, client).selector();
});

// Login to Discord Api
client.login(config.discord.token).then().catch(console.error);

// web gateway
const express = require('express')
const bodyparser = require('body-parser')
const path = require('path')
const app = express()

const Publishable_Key = config.stripe.publishableKey;
const Secret_Key = config.stripe.secretKey;

const stripe = require('stripe')(Secret_Key)

const port = process.env.PORT || 4000

app.use(bodyparser.urlencoded({extended:false}))
app.use(bodyparser.json())
app.use(express.static(__dirname+"/views/"));

app.get('/', function(req, res){
    res.sendFile(path.join(__dirname+'/views/index.html'));
})

app.post('/payment', function(req, res){
    // Moreover you can take more details from user
    // like Address, Name, etc from form
    stripe.customers.create({
        email: req.body.stripeEmail,
        source: req.body.stripeToken,
    })
        .then((customer) => {
            return stripe.charges.create({
                amount: 7000,    // Charing Rs 25
                description: 'Web Development Product',
                currency: 'USD',
                customer: customer.id
            });
        })
        .then((charge) => {
            res.send("Success") // If no error occurs
        })
        .catch((err) => {
            res.send(err)    // If some error occurs
        });
})

app.listen(port, function(error){
    if(error) throw error
    console.log(`[${time(Date.now())}] Web app Listening on port: ${port}`)
})