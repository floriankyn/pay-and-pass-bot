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

// discord id verification
app.get('/discord-bool/:id', async (req, res) => {
    let discordId = req.params.id;
    let answer = false;

    if(discordId.length === 18) {
        if(await client.users.cache.some(user => user.id === discordId)) {
            answer = true;
        }
    }

    await res.send({
        id_validity: answer
    });

});

// push discord id to database
app.get("/discord-push/:discordId/:channelId", async (req, res) => {
    let discordId = req.params.discordId;
    let channelId = req.params.channelId;

    console.log(discordId, channelId)

    let answer = false;

    if(await client.users.cache.some(user => user.id === discordId)) {
        if(await client.channels.cache.some(channel => channel.id === channelId)) {
            answer = true;
        }
    }

    if(answer) {
        db.connection().query(`SELECT * FROM dc_purchased_users WHERE user_id = "${discordId}" AND channel_id = ${channelId}`, (err, rows) => {
            if(err) throw err;
            // 30 days equals 2592000000 ms
            let sql;

            if(rows.length >= 1) {
                sql = `UPDATE dc_purchased_users SET time = ${parseInt(rows[0].time) + 2592000000} WHERE user_id = "${discordId}" AND channel_id = "${channelId}"`;
            } else {
                sql = `INSERT INTO dc_purchased_users (user_id, order_id, time, channel_id) VALUES ("${discordId}", "stripe_order_d", "2592000000", "${channelId}")`;
            }

            db.connection().query(sql, (err) => {
                let obj;
                if(err) {
                    obj = {
                        query_state: "error"
                    }
                } else {
                    obj = {
                        query_state: "success"
                    }
                }
                res.send(obj);
            });
        });
    } else {
        res.send({
            query_state: "error"
        });
        // return an error message
    }
});

// product route creation
//setInterval(() => {
    stripe.products.list({
        active: true
    }).then(respond => {
       for(let i = 0; respond.data.length > i; i++) {
           app.get(`/${respond.data[i].id}/`, (req, res) => {
               db.connection().query(`SELECT * FROM dc_private_channels WHERE stripe_product_id = "${respond.data[i].id}"`,  (err, rows) => {
                   stripe.paymentIntents.create({
                       amount: rows[0].price * 100,
                       currency: "usd",
                       description: "Access to the private channel."
                   }).then(respond => {
                       let channel = client.channels.cache.get(rows[0].channel_id);
                       let guild = client.guilds.cache.get(rows[0].guild_id);
                       res.render('index', {
                           price: parseInt(respond.amount) / 100,
                           channelName: `${channel.name}`,
                           channelId: rows[0].channel_id,
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
