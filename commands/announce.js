const BaseCommand = require('../BaseCommand.js');

class AnnounceCommand extends BaseCommand {
	constructor () {
		super();
		this.name = 'announce';
		this.description = 'test session announcement.';
	}
	execute(message, args) {
		message.reply("test announcement");
	}
}

module.exports = AnnounceCommand
