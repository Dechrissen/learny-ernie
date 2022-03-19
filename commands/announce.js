const BaseCommand = require('../BaseCommand.js');

class AnnounceCommand extends BaseCommand {
	constructor () {
		super();
		this.name = 'announce';
		this.description = 'test session announcement.';
	}
	execute(message, args) {
		//message.channel.send = (message.content);
		//let member = message.member;
    //let role = message.guild.roles.cache.find(r => r.name === 'Follower');
    //member.roles.add(role).catch(console.error);
		message.reply("test announcement");
	}
}

module.exports = AnnounceCommand
