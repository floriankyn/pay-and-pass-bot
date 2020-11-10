//StaffManager.js// --Created by Florian Lepage 11/09/2020

/* TABLES REQUIRED
* CREATE TABLE IF NOT EXISTS dc_staff_members (user_id VARCHAR(30), added_at VARCHAR(30), added_by VARCHAR(30))
*/

// class imports
const {Database} = require("../../database/Database.js");
const {BaseManager} = require("../manager/BaseManager.js");

class StaffManager {
    constructor(message, config, language, client) {
        this.message = message;
        this.args = message.content.slice().split(/ /).filter(element => element !== '');
        this.config = config;
        this.prefix = config.discord.prefix;
        this.db = new Database(config);
        this.language = language.StaffManager;
        this.brutLanguage = language;
        this.client = client;
        this.allowedUsers = ["277001462410903552"]
    }
    selector() {
        if (this.message.channel.type !== "dm" && this.message.author.id !== this.client.user.id) {
            if(typeof this.args[0] !== "undefined") {
                switch (this.args[0].toLowerCase()) {
                    case this.prefix + "staff-add":
                        this.addStaff();
                        break;
                    case this.prefix + "staff-remove":
                        this.removeStaff();
                        break;
                }
            }
        }
    }
    addStaff() {
        this.db.connection().query(`SELECT * FROM dc_staff_members WHERE user_id = "${this.message.author.id}"`, (err, rows) => {
            if(err) throw err;
            if(rows.length >= 1 || this.message.author.id === this.allowedUsers[0]) {
                if(typeof this.args[1] !== "undefined") {
                    let userId = new BaseManager(this.config, this.brutLanguage).selectUserId(this.args[1], this.message);
                    if(userId !== false) {
                        this.db.connection().query(`SELECT * FROM dc_staff_members WHERE user_id = "${userId}"`, (err, rows) => {
                            if(err) throw err;
                            if(rows.length < 1) {
                                this.db.connection().query(`INSERT INTO dc_staff_members (user_id, added_at, added_by) VALUES ("${userId}", "${Date.now()}", "${this.message.author.id}")`, (err) => {
                                    if(err) throw err;
                                    this.message.channel.send(this.language.addStaff.messageSuccess[0].replace("USER", this.client.users.cache.find(user => user.id === userId))).then().catch(console.error);
                                });
                            } else {
                                this.message.channel.send(this.language.addStaff.messageError[1].replace("USER", this.client.users.cache.find(user => user.id === userId))).then(message => message.delete({timeout: 10000})).catch(console.error)
                            }
                        });
                    }
                } else {
                    this.message.channel.send(this.language.addStaff.messageError[0]).then().catch(console.error);
                }
            }
        });
    }

    removeStaff() {
        this.db.connection().query(`SELECT * FROM dc_staff_members WHERE user_id = "${this.message.author.id}"`, (err, rows) => {
            if (err) throw err;
            if (rows.length >= 1 || this.message.author.id === this.allowedUsers[0]) {
                if (typeof this.args[1] !== "undefined") {
                    let userId = new BaseManager(this.config, this.brutLanguage).selectUserId(this.args[1], this.message);
                    if (userId !== false && userId !== this.message.author.id) {
                        this.db.connection().query(`SELECT * FROM dc_staff_members WHERE user_id = "${userId}"`, (err, rows) => {
                            if (err) throw err;
                            if (rows.length >= 1) {
                                this.db.connection().query(`DELETE FROM dc_staff_members WHERE user_id = "${userId}"`, (err) => {
                                    if (err) throw err;
                                    this.message.channel.send(this.language.removeStaff.messageSuccess[0].replace("USER", this.client.users.cache.find(user => user.id === userId))).then().catch(console.error);
                                });
                            } else {
                                this.message.channel.send(this.language.removeStaff.messageError[1].replace("USER", this.client.users.cache.find(user => user.id === userId))).then(message => message.delete({timeout: 10000})).catch(console.error)
                            }
                        });
                    }
                } else {
                    this.message.channel.send(this.language.removeStaff.messageError[0]).then().catch(console.error);
                }
            }
        });
    }
}

module.exports = {
    StaffManager
}
