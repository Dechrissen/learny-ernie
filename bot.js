#!/usr/bin/env node

const Discord = require('discord.js');
const cron = require('cron');
const fs = require('fs');
const config = require("./config.json");
const basicCommands = require('./commands/basic_commands.json');
const StudyingSaturday = require('./StudyingSaturday.js');

var commandList = []; // for storing a list of command names
const prefix = "$";

const client = new Discord.Client({
  intents: [
		Discord.Intents.FLAGS.GUILDS,
		Discord.Intents.FLAGS.GUILD_MEMBERS,
		Discord.Intents.FLAGS.GUILD_MESSAGES,
		Discord.Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
		Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS ]
});

// sets a Discord.Collection of bot commands
function setBotCommands (client) {
	client.commands = new Discord.Collection();
	const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const CommandClass = require(`./commands/${file}`);
		const command = new CommandClass();
		client.commands.set(command.name, command);
		commandList.push(command.name);
	}
	for (const name in basicCommands) {
		commandList.push(name);
	}
}

// EVENT LISTENERS //
client.once('ready', () => {
  console.log(`Ready! Logged in as ${client.user.tag}.`);

	// Set bot's displayed activity on Discord
	client.user.setActivity('Studying Saturdays');

	// Create collection of nonbasic bot commands
	setBotCommands(client);

	// Define some relevant IDs
	derkscord_id = '577602263682646017';
	classroom_channel_id = '954723619924226129';
	learner_role_id = '954771555680944270';
	participant_role_id = '954779034519224390';

	const derkscord = client.guilds.cache.get(derkscord_id);
	StudyingSaturday.begin(derkscord);

	// Weekly reminder for Studying Saturdays event
	// This runs every Saturday 10 minutes prior to 11:00:00
	let reminderAnnouncement = new cron.CronJob('0 50 10 * * 6', () => {
         const guild = client.guilds.cache.get(derkscord_id);
         const channel = guild.channels.cache.get(classroom_channel_id);
         channel.send('<@&' + learner_role_id + '> *Studying Saturday* will begin in 10 minutes!');
  });

	// Weekly Studying Saturdays announcement message
	// This runs every Saturday at 11:00:00
	let eventAnnouncement = new cron.CronJob('0 0 11 * * 6', () => {
         const guild = client.guilds.cache.get(derkscord_id);
         const channel = guild.channels.cache.get(classroom_channel_id);
         channel.send('<@&' + learner_role_id + '> It\'s time for *Studying Saturday*!');
				 StudyingSaturday.begin();
  });

// Enable the announcements:
reminderAnnouncement.start();
eventAnnouncement.start();
});

client.on("messageCreate", message => {
	// The simpler way
	let embed = new Discord.MessageEmbed({
	 title: '**Hello World**',
	 description: 'Markdown _for the win_!'
	});

	embed.setColor(7081235);
	embed.setTimestamp(message.createdAt);
	

  // checks to see if message author is a bot, or if it doesn't start with "!"
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
	const command = args.shift().toLowerCase();

	// !commands
	if (command == "commands") {
		var listOfCommands = [];
		for (const c in commandList) {
			listOfCommands.push(prefix + commandList[c]);
		}
		const search = ',';
		const replacer = new RegExp(search, 'g');
		var stringOfCommands = listOfCommands.toString();
		const new_stringOfCommands = stringOfCommands.replace("\\[|\\]", "").replace(replacer, " | ");
		message.channel.send("**Bot commands**: " + new_stringOfCommands);
		// log user's command use in console
		console.log(`${message.author.tag} from #${message.channel.name}: ` + message.content);
		return;
	}

	// basic text command
  if (!client.commands.has(command)) {
		if (basicCommands[command]) {
			message.channel.send(basicCommands[command]);
		}
		else {
			message.reply("No such command.");
			return;
		}
	}
	// other commands
	else {
		try {
	  	client.commands.get(command).execute(message, args);
	  } catch (error) {
	  	console.error(error);
	  	message.reply('Error trying to execute that command.');
	  }
	}
	// log user's command use in console
	console.log(`${message.author.tag} from #${message.channel.name}: ${message.content}`);
});

// Log in
client.login(config.BOT_TOKEN);
