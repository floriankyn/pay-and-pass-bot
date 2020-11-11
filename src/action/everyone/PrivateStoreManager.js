//PrivateStoreManager.js// --created by Florian Lepage 11/11/2020

// lib imports
const {MessageEmbed} = require("discord.js");
const {Database} = require("../../database/Database.js");

class PrivateStoreManager{
    constructor(message, config, language, client) {
        this.message = message;
        this.args = message.content.slice().split(/ /).filter(element => element !== '');
        this.config = config;
        this.prefix = config.discord.prefix;
        this.language = language.PrivateStoreManager;
        this.brutLanguage = language;
        this.client = client;
        this.db = new Database(config);
    }
    selector() {
        if(this.message.channel.type !== "dm" && this.message.author.id !== this.client.user.id) {
            if(typeof this.args[0] !== "undefined") {
                switch (this.args[0]) {
                    case this.prefix + "store":
                        this.store();
                        break;
                }
            }
        }
    }
    store() {
        this.db.connection().query(`SELECT * from dc_private_channels WHERE guild_id = "${this.message.guild.id}"`, (err, rows) => {
           if(err) throw err;
           if(rows.length >= 1) {
               this.message.channel.send(
                   this.embed(1, rows)
               ).then().catch(console.error)
           } else {
               this.message.delete().then(message => {
                   message.channel.send(
                       this.language.messageError[0]
                   ).then(message => message.delete({timeout: 10000})).catch(console.error);
               }).catch(console.error);
           }
        });
    }
    embed(Case, info) {
        switch (Case) {
            case 1:
                let stuff = [];
                for(let i = 0; info.length > i; i++) {
                    let channel = this.message.guild.channels.cache.get(info[i].channel_id)
                    stuff.push({
                        name: `:coin: $${info[i].price} #${channel.name}`,
                        value: ` - [${channel.topic !== null ? channel.topic : `Private access to ${channel} for $${info[i].price}.`}](http://localhost:3000/${info[i].stripe_product_id})`,
                        inline: false
                    });
                }
                return new MessageEmbed()
                    .setAuthor(`Private Channel Store:`, this.client.user.avatarURL())
                    .setColor("BLACK")
                    .addFields(stuff)
                    .setFooter(this.client.user.username)
                    .setTimestamp()
        }
    }
}
module.exports = {
    PrivateStoreManager
}
