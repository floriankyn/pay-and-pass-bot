//server.js// --created by Florian Lepage

// express init
const express = require('express');
const app = express();
const port = 3001;

// ejs render engine set
const pug = require("ejs")
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/views"))

// config import
const fs = require("fs");
const config = JSON.parse(fs.readFileSync("./config/config.json"));

// discord client instance
const discord = require("discord.js");
const client = new discord.Client({partials: ['MESSAGE', 'CHANNEL', 'REACTION']});
client.login(config.discord.token).then().catch(console.error);

// stripe init
const stripe = require('stripe')(config.stripe.secretKey);

// Database init
const {Database} = require("./database/Database.js");
const db = new Database(config);

// homepage route creation
app.get('/', (req, res) => {
    res.send('Hello World!')
});

// product route creation
//setInterval(() => {
    stripe.products.list({
        active: true
    }).then(respond => {
       for(let i = 0; respond.data.length > i; i++) {
           app.get(`/${respond.data[i].id}/`, (req, res) => {
               db.connection().query(`SELECT * FROM dc_private_channels WHERE stripe_product_id = "${respond.data[i].id}"`, async (err, rows) => {
                   await stripe.paymentIntents.create({
                       amount: rows[0].price * 100,
                       currency: "usd",
                       description: "Access to the private channel."
                   }).then(respond => {
                       let channel = client.channels.cache.get(rows[0].channel_id);
                       let guild = client.guilds.cache.get(rows[0].guild_id);
                       console.log(respond.client_secret)
                       res.render('index', {
                           price: parseInt(respond.amount) / 100,
                           channelName: `${channel.name}`,
                           clientSecret: respond.client_secret,
                           publishableKey: config.stripe.publishableKey,
                           discordImage: guild.iconURL() !== null ? guild.iconURL() : "https://res-3.cloudinary.com/crunchbase-production/image/upload/c_lpad,h_170,w_170,f_auto,b_white,q_auto:eco/v1440924046/wi1mlnkbn2jluko8pzkj.png",
                           channelDescription: `${channel.topic !== null ? channel.topic : `Private access to #${channel.name} for $${parseInt(respond.amount) / 100} per month.`} `,
                       });
                   }).catch(console.error);
               });
           });
       }
    }).catch(console.error);
//}, 10000)


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});
