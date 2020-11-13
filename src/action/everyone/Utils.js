//Utils.js// --Created by Florian Lepage 11/09/2020

// lib imports
const {MessageEmbed} = require("discord.js");

class Utils{
    constructor(message, config, language, client) {
        this.message = message;
        this.args = message.content.slice().split(/ /);
        this.config = config;
        this.prefix = config.discord.prefix;
        this.language = language.Utils;
        this.brutLanguage = language;
        this.client = client;
    }
    selector() {
        if(this.message.author.id !== this.client.user.id) {
            if(this.message.channel.type !== "dm") {
                switch (this.args[0]) {
                    case this.prefix + "help":
                        this.help();
                        break;
                    case this.prefix + "info":
                        this.info();
                        break;
                    case this.prefix + "store":
                        this.store();
                        break;
                    case this.prefix + "id":
                        this.sub();
                        break;
                    case this.message.content.charAt(2) === "!" ? `<@!${this.client.user.id}>` : `<@${this.client.user.id}>`: // reply the bot prefix
                        this.message.channel.send(this.language.prefix.message.replace("AUTHORID", this.message.author.id).replace("PREFIX", this.prefix)).then().catch(console.error);
                        break;
                }
            }
        }
    }
    sub() {
        this.message.channel.send(
            this.embed("sub")
        ).then().catch(console.error);
    }
    info() {
        this.message.channel.send(
            this.embed("info")
        ).then().catch(console.error);
    }
    help() {
        this.message.channel.send(
            this.embed("help")
        ).then().catch(console.error);
    }
    store() {

    }
    embed(Case) {
        switch (Case) {
            case "help":
                return new MessageEmbed()
                    .setAuthor(this.language.help.title[0], this.client.user.avatarURL())
                    .addField(`${this.language.help.fieldName[0]}`,
                        "`" + `${this.prefix}store` + ":` " + this.language.help.value[8] + "\n" +
                        "`" + `${this.prefix}id` + ":` " + this.language.help.value[0] + "\n" +
                        "`" + `${this.prefix}info` + ":` " + this.language.help.value[1] + "\n" +
                        "`" + `${this.prefix}help` + ":` " + this.language.help.value[2] + "\n" +
                        "\u200B󠀠󠀠󠀠 \n"
                    )
                    .addField(`${this.language.help.fieldName[1]}:`,
                        "`" + `${this.prefix}staff-add <@user/userId>` + ":` " + this.language.help.value[3] + "\n" +
                        "`" + `${this.prefix}staff-remove <@user/userId>` + ":` " + this.language.help.value[4] + "\n" +
                        "\u200B󠀠󠀠󠀠 \n" +
                        "`" + `${this.prefix}private-channel-set <Price>` + ":` " + this.language.help.value[5] + "\n" +
                        "`" + `${this.prefix}private-channel-remove` + ":` " + this.language.help.value[6] + "\n" +
                        "`" + `${this.prefix}channel-info` + ":` " + this.language.help.value[7] + "\n" +
                        "\u200B󠀠󠀠󠀠 \n"
                    )
                    .setColor("BLACK")
                    .setFooter(this.message.guild.name)
                    .setTimestamp()
            case "info":
                return new MessageEmbed()
                    .setAuthor("Information about me:", this.client.user.avatarURL())
                    .setThumbnail(this.message.author.avatarURL())
                    .addFields(
                        {
                            name: `Bot Name:`,
                            value: `[${this.client.user.username}](https://discord.com/developers/applications/${this.client.user.id}/information)`,
                            inline: true
                        },
                        {
                            name: '\u200b',
                            value: '\u200b',
                            inline: true,
                        },
                        {
                            name: `Bot Language`,
                            value: `[discord.js](https://discord.js.org/#/)`,
                            inline: true
                        },
                        {
                            name: `Bot Version:`,
                            value: `[version 1.0](https://github.com/ChigusaKayano/nitishreddy)`,
                            inline: true
                        },
                        {
                            name: '\u200b',
                            value: '\u200b',
                            inline: true,
                        },
                        {
                            name: `Bot Developer:`,
                            value: `[florian_kyn](https://www.instagram.com/florian_kyn/)`,
                            inline: true
                        },
                    )
                    .setColor("BLACK")
                    .setFooter(this.message.guild.name)
                    .setTimestamp()
            case "sub":
                return new MessageEmbed()
                    .setAuthor("Subscription information:", this.client.user.avatarURL())
                    .setThumbnail(this.message.author.avatarURL())
                    .addFields(
                        {
                            name: `Discord Member:`,
                            value: `${this.message.author}`,
                            inline: true
                        },
                        {
                            name: '\u200b',
                            value: '\u200b',
                            inline: true,
                        },
                        {
                            name: `Discord ID:`,
                            value: "`" + this.message.author.id + "`",
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
    Utils
}
