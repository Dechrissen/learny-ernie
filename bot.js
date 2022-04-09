#!/usr/bin/env node

const Discord = require("discord.js");
const cron = require("cron");
const fs = require("fs");
const config = require("./config.json");
const basicCommands = require("./commands/basic_commands.json");
const StudyingSaturday = require("./StudyingSaturday.js");

var commandList = []; // for storing a list of command names
const prefix = "$";

// Learny Ernie's Discord user ID
ernie_id = "954748023911624724";

const client = new Discord.Client({
  intents: [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MEMBERS,
    Discord.Intents.FLAGS.GUILD_MESSAGES,
    Discord.Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
});

// sets a Discord.Collection of bot commands
function setBotCommands(client) {
  client.commands = new Discord.Collection();
  const commandFiles = fs
    .readdirSync("./commands")
    .filter((file) => file.endsWith(".js"));
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
client.once("ready", () => {
  console.log(`Ready! Logged in as ${client.user.tag}.`);

  // set bot's displayed activity on Discord
  client.user.setActivity("Studying Saturdays");

  // create collection of nonbasic bot commands
  setBotCommands(client);

  // declare global list for storing participants each week
  // this list is cleared after each event
  global.participant_ids = [];

  // define some relevant IDs
  derkscord_id = "577602263682646017";
  classroom_channel_id = "961117247592615976";
  rules_channel_id = "954983007066947584";
  learner_role_id = "954771555680944270";
  learner_role_message_id = "961117639118299186";

  const derkscord = client.guilds.cache.get(derkscord_id);
  const classroom = derkscord.channels.cache.get(classroom_channel_id);
  const rules = derkscord.channels.cache.get(rules_channel_id);

  // cache the Learner role assignment message
  rules.messages
    .fetch(learner_role_message_id)
    .then((message) => console.log("Cached message: " + message.content))
    .catch(console.error);

  // tests
  //StudyingSaturday.beginRegistration(derkscord);
  //StudyingSaturday.beginStudy(derkscord);
  //StudyingSaturday.participate("aaaaaa");
  //StudyingSaturday.handleScores(participant_ids);

  let roleCreationSchedule = new cron.CronJob("0 0 13 * * 6", () => {
    // SAT 9 AM
    // creates the Participant role weekly
    derkscord.roles
      .create({
        name: "Participant",
        color: "#a714a1",
        position: 99,
        mentionable: true,
      })
      .then((new_role) => {
        // set #classroom permissions for Participant role
        classroom.permissionOverwrites.set(
          [
            {
              id: derkscord_id,
              deny: ["VIEW_CHANNEL", "SEND_MESSAGES"],
            },
            {
              id: learner_role_id,
              allow: ["VIEW_CHANNEL"],
            },
            {
              id: new_role.id,
              allow: ["VIEW_CHANNEL", "SEND_MESSAGES"],
            },
          ],
          "Changing permissions of #classroom to allow newly created Participant role to send messages."
        );
      })
      .then(
        console.log("Participant role created, #classroom permissions updated")
      )
      .catch(console.error);
  });

  let reminderAnnouncement = new cron.CronJob("0 50 14 * * 6", () => {
    // SAT 10:50 AM
    // weekly reminder for Studying Saturdays event (pings Learner role)
    classroom.send(
      "<@&" +
        learner_role_id +
        "> *Studying Saturday* will begin in 10 minutes!"
    );
    // begins the registration period
    // during this phase is when users are assigned the Participant role
    StudyingSaturday.beginRegistration(derkscord);
  });

  let studyAnnouncement = new cron.CronJob("0 0 15 * * 6", () => {
    // SAT 11 AM
    // weekly Studying Saturdays announcement message
    let participant_role = derkscord.roles.cache.find(
      (role) => role.name === "Participant"
    );
    let participant_role_id = participant_role.id;
    classroom.send(
      "<@&" + participant_role_id + "> It's time for *Studying Saturday*!"
    );
    StudyingSaturday.beginStudy(derkscord);
  });

  let writingAnnouncement = new cron.CronJob("0 20 15 * * 6", () => {
    // SAT 11:20 AM
    // weekly writing phase announcement
    let participant_role = derkscord.roles.cache.find(
      (role) => role.name === "Participant"
    );
    let participant_role_id = participant_role.id;
    classroom.send(
      "<@&" +
        participant_role_id +
        "> Studying Phase has ended! Write a short paragraph about your learning. You have 10 minutes!"
    );
  });

  let discussionAnnouncement = new cron.CronJob("0 30 15 * * 6", () => {
    // SAT 11:30 AM
    // weekly discussion phase announcement
    let participant_role = derkscord.roles.cache.find(
      (role) => role.name === "Participant"
    );
    let participant_role_id = participant_role.id;
    classroom.send(
      "<@&" +
        participant_role_id +
        "> Writing Phase has ended! Discuss the topic with the group to **crystallize your learning**.\nThe classroom closes in 30 minutes."
    );
  });

  let overAnnouncement = new cron.CronJob("0 0 16 * * 6", () => {
    // SAT 12 PM
    // weekly end-of-event announcement
    classroom.send("Studying Saturday has ended. See you next week! 🤓");
    let participant_role = derkscord.roles.cache.find(
      (role) => role.name === "Participant"
    );
    // delete the role to remove it from all members
    participant_role
      .delete("Studying Saturday is over; removed role from all users.")
      .then(console.log)
      .catch(console.error);
    // increment points and streaks for all participants
    StudyingSaturday.handleScores(participant_ids);
    // clear global participant_ids list after end of event
    participant_ids = [];
  });

  // enable the scheduled announcements
  reminderAnnouncement.start();
  studyAnnouncement.start();
  writingAnnouncement.start();
  discussionAnnouncement.start();
  overAnnouncement.start();
  roleCreationSchedule.start();

  // in case I need to resend the Learner role reaction message
  //rules.send("React with ✋ to get the Learner role.").then((sent) => {
  //  sent.react("✋");
  //});
  //rules.messages.fetch(learner_role_message_id).then((msg) => {
  //  msg.react("✋");
  //});
});

// reaction listener for Learner role assignment in #rules channel
client.on("messageReactionAdd", (reaction, user) => {
  // checks
  if (reaction.message.id !== learner_role_message_id) return;
  if (user.id == ernie_id) return;
  if (reaction.emoji.name !== "✋") {
    reaction.users.remove(user);
    return;
  }

  // add Learner role to user who reacts to this message in #rules
  const derkscord = client.guilds.cache.get(derkscord_id);
  const role = derkscord.roles.cache.find((role) => role.name == "Learner");
  if (!role) return;
  derkscord.members
    .fetch(user.id)
    .then((member) => {
      member.roles.add(role);
    })
    .catch(console.error);
  reaction.users.remove(user);
});

client.on("messageCreate", (message) => {
  // checks to see if message author is a bot, or if it doesn't start with "!"
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // $commands
  if (command == "commands") {
    var listOfCommands = [];
    for (const c in commandList) {
      listOfCommands.push(prefix + commandList[c]);
    }
    const search = ",";
    const replacer = new RegExp(search, "g");
    var stringOfCommands = listOfCommands.toString();
    const new_stringOfCommands = stringOfCommands
      .replace("\\[|\\]", "")
      .replace(replacer, " | ");
    message.channel.send("**Commands**: " + new_stringOfCommands);
    // log user's command use in console
    console.log(
      `${message.author.tag} from #${message.channel.name}: ` + message.content
    );
    return;
  }

  // basic text command
  if (!client.commands.has(command)) {
    if (basicCommands[command]) {
      message.channel.send(basicCommands[command]);
    } else {
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
      message.reply("Error trying to execute that command.");
    }
  }
  // log user's command use in console
  console.log(
    `${message.author.tag} from #${message.channel.name}: ${message.content}`
  );
});

// log in as bot (bot token from ./config.json)
client.login(config.BOT_TOKEN);
