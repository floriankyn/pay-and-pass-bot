//BaseManager.js// --Created by Florian Lepage 11/09/2020

class BaseManager {
    constructor(config, language) {
        this.config = config;
        this.language = language.BaseManager;
    }
    selectUserId(args, message) {
        let userId;
        if (args.charAt(0) === "<") {
            userId = message.mentions.members.first().id;
        } else {
            userId = args;
        }
        if(userId.length === 18) {
            if(message.guild.members.cache.some(user => user.id === userId)) {
                return userId;
            } else {
                message.channel.send(this.language.selectUserId.messageError[1]).then(message => message.delete({timeout: 10000})).catch(console.error);
                return false;
            }
        } else {
            message.channel.send(this.language.selectUserId.messageError[0]).then(message => message.delete({timeout: 10000})).catch(console.error);
            return false;
        }
    }
    selectRoleId(args, message) {
        let roleId;
        if (args.charAt(0) === "<") {
            roleId = message.mentions.roles.first().id;
        } else {
            roleId = args;
        }
        if(roleId.length === 18) {
            if(message.guild.roles.cache.some(roles => roles.id === roleId)) {
                return roleId;
            } else {
                message.channel.send(this.language.selectRoleId.messageError[1]).then(message => message.delete({timeout: 10000})).catch(console.error);
                return false;
            }
        } else {
            message.channel.send(this.language.selectRoleId.messageError[0]).then(message => message.delete({timeout: 10000})).catch(console.error);
            return false;
        }
    }

    getDate(timestamp) {
        let date = new Date(timestamp);
        return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`
    }
}

module.exports = {
    BaseManager
}
