const BaseCommand = require("../BaseCommand.js");

class LearnerCommand extends BaseCommand {
  constructor() {
    super();
    this.name = "learn";
    this.description = "Assigns the Learner role to the user.";
  }
  execute(message, args) {
    let member = message.member;
    let role = message.guild.roles.cache.find((r) => r.name === "Learner");
    member.roles.add(role).catch(console.error);
    message.reply("You have been assigned the Learner role. 🤓");
  }
}

module.exports = LearnerCommand;
