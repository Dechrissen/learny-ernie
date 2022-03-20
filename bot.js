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


	const derkscord = client.guilds.cache.get(derkscord_id);
  const classroom = derkscord.channels.cache.get(classroom_channel_id);

	//StudyingSaturday.beginRegistration(derkscord);
  //StudyingSaturday.beginStudy(derkscord);

	// Weekly reminder for Studying Saturdays event
	// This runs every Saturday 10 minutes prior to 11:00:00
	let reminderAnnouncement = new cron.CronJob('5 * * * * 6', () => {

        classroom.send('<@&' + learner_role_id + '> *Studying Saturday* will begin in 10 minutes!');
        StudyingSaturday.beginRegistration(derkscord);
  });

	// Weekly Studying Saturdays announcement message
	// This runs every Saturday at 11:00:00
	let studyAnnouncement = new cron.CronJob('0 0 11 * * 6', () => {
         let participant_role = derkscord.roles.cache.find(role => role.name === "Participant");
         let participant_role_id = participant_role.id;
         classroom.send('<@&' + participant_role_id + '> It\'s time for *Studying Saturday*!');
         StudyingSaturday.beginStudy(derkscord);
  });

  let writingAnnouncement = new cron.CronJob('0 20 11 * * 6', () => {
    let participant_role = derkscord.roles.cache.find(role => role.name === "Participant");
    let participant_role_id = participant_role.id;
         classroom.send('<@&' + participant_role_id + '> Studying Phase has ended! Write a short paragraph about your learning. 10 minutes!');
  });

  let discussionAnnouncement = new cron.CronJob('0 30 11 * * 6', () => {
    let participant_role = derkscord.roles.cache.find(role => role.name === "Participant");
    let participant_role_id = participant_role.id;
         classroom.send('<@&' + participant_role_id + '> Writing Phase has ended! Discuss the topic with the group to **solidify your learning**.\nThe classroom closes in 30 minutes.');
  });

  let overAnnouncement = new cron.CronJob('40 * * * * 6', () => {
         classroom.send('Studying Saturday has ended. See you next week! 🤓');
         //const role = derkscord.roles.cache.get(participant_role_id);
         let participant_role = derkscord.roles.cache.find(role => role.name === "Participant");


         participant_role.delete('Studying Saturday is over; removed role from all users.')
         .then(console.log)
         .catch(console.error);
  });

  let roleCreationSchedule = new cron.CronJob('15 * * * * *', () => {
    // creates the Participant role daily
    derkscord.roles.create({
       name: "Participant",
       color: "#0aa22c",
       position: 99,
       mentionable: true
    })
    .then(console.log)
    .catch(console.error);
  });

// Enable the announcements
reminderAnnouncement.start();
studyAnnouncement.start();
writingAnnouncement.start();
discussionAnnouncement.start();
overAnnouncement.start();
roleCreationSchedule.start();
});

client.on("messageCreate", message => {
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
