//PrivateManager.js// --Created by Florian Lepage 11/09/2020

/* TABLES REQUIRED
* CREATE TABLE IF NOT EXISTS dc_private_channels (channel_id VARCHAR(30), guild_id VARCHAR(30), role_id VARCHAR(30), renewal_in_ms VARCHAR(255), added_at VARCHAR(30), added_by VARCHAR(30))
* CREATE TABLE IF NOT EXISTS dc_purchased_users (user_id VARCHAR(30), order_id VARCHAR(30), time VARCHAR(30), channel_id VARCHAR(30))
*/

//lib imports
const {Database} = require("../../database/Database.js");
const {BaseManager} = require("../manager/BaseManager.js");
const {MessageEmbed} = require("discord.js");
const stripe = require('stripe')('sk_test_51HiWyuF6q8U5dXkGJAEJQ59bXU8tRZ74WbBG5pGD4pFeJeYK9Zekhk1sJiy9FA8ngLMLrM7PABdy2C6EMHNbnHIm00aFPQM8Pu');

class PrivateManager{
    constructor(message, config, language, client) {
        this.message = message;
        this.args = message.content.slice().split(/ /).filter(element => element !== '');
        this.config = config;
        this.prefix = config.discord.prefix;
        this.language = language.PrivateManager;
        this.brutLanguage = language;
        this.client = client;
        this.db = new Database(config);
    }
    selector() {
        if(this.message.channel.type !== "dm" && this.message.author.id !== this.client.user.id) {
            if(typeof this.args[0] !== "undefined") {
                switch (this.args[0].toLowerCase()) {
                    case this.prefix + "private-channel-set":
                        this.privateChannelSet();
                        break;
                    case this.prefix + "private-channel-remove":
                        this.privateChannelRemove()
                        break;
                    case this.prefix + "channel-info":
                        this.channelInfo();
                        break;
                }
            }
        }
    }
    channelInfo() {
        this.db.connection().query(`SELECT * FROM dc_private_channels WHERE channel_id = "${this.message.channel.id}"`, (err, rows) => {
            if(err) throw err;
            if(rows.length >= 1) {
                this.message.channel.send(
                    this.embed("channelPrivateTrue", rows)
                ).then().catch(console.error);
            } else {
                this.message.channel.send(
                    this.embed("channelPrivateFalse")
                ).then().catch(console.error);
            }
        });
    }
    privateChannelRemove() {
        this.db.connection().query(`SELECT * FROM dc_staff_members WHERE user_id = "${this.message.author.id}"`, (err, rows) => {
            if(err) throw err;
            if(rows.length >= 1) {
                this.db.connection().query(`SELECT * FROM dc_private_channels WHERE channel_id = "${this.message.channel.id}"`, (err, rows) => {
                    if(err) throw err;
                    if(rows.length >= 1) {
                        this.db.connection().query(`DELETE FROM dc_private_channels WHERE channel_id = "${this.message.channel.id}"`, (err) => {
                            if(err) throw err;
                            stripe.products.update(
                                rows[0].stripe_product_id,
                                {
                                    active: false
                                }
                            ).then().catch(console.error);

                            let overwrites = []; // permissions container
                            let rolesId = []; //server roles id container
                            this.message.guild.roles.cache.map(role => rolesId.push(role.id)); //guild roles mapper
                            for(let i = 0; rolesId.length > i; i++) {
                                overwrites.push(
                                    {
                                        id: rolesId[i],
                                        allow: [
                                            "VIEW_CHANNEL",
                                            "SEND_MESSAGES",
                                            "ADD_REACTIONS",
                                            "ATTACH_FILES",
                                            "EMBED_LINKS"
                                        ]
                                    }
                                );
                            }
                            this.message.channel.overwritePermissions(overwrites,
                                `Channel set back to public by ${this.message.author.id}`
                            ).then(channel => {
                                channel.send(
                                    this.language.privateChannelRemove.messageSuccess[0]
                                ).then().catch(console.error);
                            }).catch(console.error);
                        });
                    } else { // return an error message if the channel not set as private
                        this.message.delete().then(message => {
                            message.channel.send(
                                this.language.privateChannelRemove.messageError[1]
                            ).then(message => message.delete({timeout: 10000})).catch(console.error);
                        }).catch(console.error);
                    }
                });
            } else { // return an error message if the user is not in the staff table
                this.message.delete().then(message => {
                    message.channel.send(
                        this.language.privateChannelRemove.messageError[0]
                    ).then(message => message.delete({timeout: 10000})).catch(console.error);
                }).catch(console.error);
            }
        });
    }
    privateChannelSet() {
        this.db.connection().query(`SELECT * FROM dc_staff_members WHERE user_id = "${this.message.author.id}"`, (err, rows) => {
            if(err) throw err;
            if(rows.length >= 1) {
                this.db.connection().query(`SELECT * FROM dc_private_channels WHERE channel_id = "${this.message.channel.id}"`, (err, rows) => {
                    if(err) throw err;
                    if(rows.length < 1) {
                        if(typeof this.args[1] !== "undefined") {
                            let roleId = new BaseManager(this.config, this.brutLanguage).selectRoleId(this.args[1], this.message);
                            if(this.message.guild.roles.cache.some(role => role.id === roleId)) {
                                if(typeof this.args[2] !== "undefined") {
                                    if(parseInt(this.args[2]) >= 1) {
                                        if(typeof this.args[3] !== "undefined") {
                                            if(parseInt(this.args[3]) > 1) {
                                                stripe.products.create({
                                                    name: this.message.channel.name,
                                                    images: [
                                                        this.message.guild.iconURL()
                                                    ],
                                                    active: true,
                                                    description: this.message.channel.topic !== null ? this.message.channel.topic : "none",
                                                }).then(async respond => {
                                                    await stripe.prices.create({
                                                        unit_amount: parseInt(this.args[3]) * 100,
                                                        currency: 'usd',
                                                        recurring: {interval: 'month'},
                                                        product: respond.id,
                                                    }).then().catch(console.error);
                                                    this.db.connection().query(`INSERT INTO dc_private_channels (stripe_product_id, channel_id, guild_id, role_id, renewal_in_ms, added_at, added_by) VALUES ("${respond.id}" ,"${this.message.channel.id}", "${this.message.guild.id}", "${roleId}", "${parseInt(this.args[2] * 86400000)}", "${Date.now()}", "${this.message.author.id}")`, (err) => {
                                                        if(err) throw err;
                                                        let overwrites = []; // permissions container
                                                        let rolesId = []; //server roles id container
                                                        this.message.guild.roles.cache.map(role => rolesId.push(role.id)); //guild roles mapper
                                                        for(let i = 0; rolesId.length > i; i++) {
                                                            if(rolesId[i] !== roleId) {
                                                                overwrites.push(
                                                                    {
                                                                        id: rolesId[i],
                                                                        deny: "VIEW_CHANNEL"
                                                                    }
                                                                );
                                                            } else {
                                                                overwrites.push(
                                                                    {
                                                                        id: rolesId[i],
                                                                        allow: [
                                                                            "VIEW_CHANNEL",
                                                                            "SEND_MESSAGES",
                                                                            "ADD_REACTIONS",
                                                                            "ATTACH_FILES",
                                                                            "EMBED_LINKS"
                                                                        ]
                                                                    }
                                                                );
                                                            }
                                                        }
                                                        this.message.channel.overwritePermissions(overwrites,
                                                            `Channel Set as privat for ${this.message.guild.roles.cache.find(role => role.id === roleId)} for ${this.args[2]} days subs.`
                                                        ).then(channel => {
                                                            channel.send(
                                                                this.language.privateChannelSet.messageSuccess[0].replace("ROLE", this.message.guild.roles.cache.find(role => role.id === roleId))
                                                            ).then().catch(console.error);
                                                        }).catch(console.error);
                                                    });
                                                }).catch(console.error);
                                            } else {
                                                this.message.delete().then(message => {
                                                    message.channel.send(
                                                        this.language.privateChannelSet.messageError[7]
                                                    ).then(message => message.delete({timeout: 10000})).catch(console.error);
                                                }).catch(console.error);
                                            }
                                        } else {
                                            this.message.delete().then(message => {
                                                message.channel.send(
                                                    this.language.privateChannelSet.messageError[6]
                                                ).then(message => message.delete({timeout: 10000})).catch(console.error);
                                            }).catch(console.error);
                                        }
                                    } else { // return an error message if the specified amount of days is under 1
                                        this.message.delete().then(message => {
                                            message.channel.send(
                                                this.language.privateChannelSet.messageError[5]
                                            ).then(message => message.delete({timeout: 10000})).catch(console.error);
                                        }).catch(console.error);
                                    }
                                } else { // return an error message if there is not renewal time specified
                                    this.message.delete().then(message => {
                                        message.channel.send(
                                            this.language.privateChannelSet.messageError[4]
                                        ).then(message => message.delete({timeout: 10000})).catch(console.error);
                                    }).catch(console.error);
                                }
                            } else { // return an error message if the specified role is not valid
                                this.message.delete().then(message => {
                                    message.channel.send(
                                        this.language.privateChannelSet.messageError[3]
                                    ).then(message => message.delete({timeout: 10000})).catch(console.error);
                                }).catch(console.error);
                            }
                        } else { // return an error message if there is no role specified
                            this.message.delete().then(message => {
                                message.channel.send(
                                    this.language.privateChannelSet.messageError[2]
                                ).then(message => message.delete({timeout: 10000})).catch(console.error);
                            }).catch(console.error);
                        }
                    } else { // return an error message if the channel is already private
                        this.message.delete().then(message => {
                            message.channel.send(
                                this.language.privateChannelSet.messageError[1]
                            ).then(message => message.delete({timeout: 10000})).catch(console.error);
                        }).catch(console.error);
                    }
                });
            } else { // return an error message if the user is not in the staff table
                this.message.delete().then(message => {
                    message.channel.send(
                        this.language.privateChannelSet.messageError[0]
                    ).then(message => message.delete({timeout: 10000})).catch(console.error);
                }).catch(console.error);
            }
        });
    }
    embed(Case, info=null) {
        switch (Case) {
            case "channelPrivateFalse":
                return new MessageEmbed()
                    .setAuthor(this.language.channelInfo.embed.channelPrivateFalse.author, this.client.user.avatarURL())
                    .setThumbnail(this.message.author.avatarURL())
                    .addFields(
                        {
                            name: this.language.channelInfo.embed.channelPrivateFalse.fields.names[0],
                            value: this.message.channel,
                            inline: true
                        },
                        {
                            name: this.language.channelInfo.embed.channelPrivateFalse.fields.names[1],
                            value: this.message.channel.parent.name,
                            inline: true
                        },
                        {
                            name: this.language.channelInfo.embed.channelPrivateFalse.fields.names[2],
                            value: this.language.channelInfo.embed.channelPrivateFalse.fields.value[0],
                            inline: true
                        },
                    )
                    .setColor("BLACK")
                    .setFooter(this.message.guild.name)
                    .setTimestamp()
            case "channelPrivateTrue":
                return new MessageEmbed()
                    .setAuthor(this.language.channelInfo.embed.channelPrivateTrue.author, this.client.user.avatarURL())
                    .setThumbnail(this.message.author.avatarURL())
                    .addFields(
                        {
                            name: this.language.channelInfo.embed.channelPrivateTrue.fields.names[0],
                            value: this.message.channel,
                            inline: true
                        },
                        {
                            name: '\u200b',
                            value: '\u200b',
                            inline: true,
                        },
                        {
                            name: this.language.channelInfo.embed.channelPrivateTrue.fields.names[1],
                            value: this.message.channel.parent.name,
                            inline: true
                        },
                        {
                            name: this.language.channelInfo.embed.channelPrivateTrue.fields.names[2],
                            value: this.language.channelInfo.embed.channelPrivateTrue.fields.value[0],
                            inline: true
                        },
                        {
                            name: '\u200b',
                            value: '\u200b',
                            inline: true,
                        },
                        {
                            name: this.language.channelInfo.embed.channelPrivateTrue.fields.names[3],
                            value: this.message.guild.roles.cache.find(role => role.id === info[0].roleId),
                            inline: true
                        },
                    )
                    .setColor("BLACK")
                    .setFooter(this.message.guild.name)
                    .setTimestamp()
        }
    }
}
module.exports = {
    PrivateManager
}
