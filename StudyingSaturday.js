const { MessageEmbed } = require("discord.js");
let fs = require("fs");

function beginRegistration(derkscord) {
  console.log("Starting Studying Saturday registration phase...");

  // define variable for classroom channel
  const classroom = derkscord.channels.cache.get(classroom_channel_id);
  let participant_role = derkscord.roles.cache.find(
    (role) => role.name === "Participant"
  );
  let participant_role_id = participant_role.id;

  const timerEmbed = new MessageEmbed().setTitle("old title");

  classroom
    .send("Registration is now open! React with 🤓 to join today's session.")
    .then((sent) => {
      // 'sent' is the message just sent
      sent.react("🤓");

      const filter = (reaction, user) => {
        return reaction.emoji.name === "🤓" && user.id !== sent.author.id;
      };

      const reactionCollector = sent.createReactionCollector({
        filter,
        time: 5000,
      }); // 9m 50s

      //classroom.send({ embeds: [timerEmbed] }).then(msg => {
      //setTimeout(function () {
      //const timerEmbed = new MessageEmbed(msg).setTitle('new title');
      //msg.edit({ embeds: [timerEmbed] });
      //}, 2000)
      //})

      reactionCollector.on("collect", (reaction, user) => {
        console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);

        // add Participant role to user
        let member = derkscord.members.cache.get(user.id);
        member.roles.add(participant_role_id);
        classroom.send(`<@${user.id}> joined!`);
      });

      reactionCollector.on("end", (collected) => {
        console.log(`Total collected participants: ${collected.size}`);
        classroom.send("Registration is now closed.");
      });
    })
    .catch((e) => {
      console.log(e);
    });
} // end of function

function beginStudy(derkscord) {
  console.log("Starting Studying Saturday event...");

  // define variable for classroom channel
  const classroom = derkscord.channels.cache.get(classroom_channel_id);

  // read topics.txt into a list
  const readFileLines = (filename) =>
    fs.readFileSync(filename).toString("UTF8").split("\r\n");
  const topics = readFileLines("./topics.txt");
  // remove the last item form the list, because it's always an empty string
  topics.splice(-1, 1);
  // choose a random topic
  const x = Math.floor(topics.length * Math.random());

  classroom.send(
    `Today\'s topic is: **${topics[x]}**!\nYou have 20 minutes to research this topic.\nGood luck! 🤓`
  );
} // end of function

function assignRole(derkscord, member) {
  let role = derkscord.roles.cache.find((r) => r.name === "Learner");
  member.roles.add(role).catch(console.error);
} // end of function

module.exports = { beginRegistration, beginStudy, assignRole };
