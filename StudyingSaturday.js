const { MessageEmbed } = require("discord.js");
const fs = require("fs");

async function participate(user_id) {
  scores_file = "./data/scores.json";

  fs.readFile(scores_file, (err, data) => {
    if (err) {
      console.log(err);
    }
    players_history = [];

    var jsonParsed = JSON.parse(data);

    for (const player in jsonParsed.players) {
      players_history.push(jsonParsed.players[player].id);
    }

    // add current participant to scores.json if they aren't already in it
    if (!players_history.includes(user_id)) {
      jsonParsed.players.push({
        id: user_id,
        points: 0,
        streak: 0,
      });
      fs.writeFile(scores_file, JSON.stringify(jsonParsed), "utf8", (err) => {
        if (err) {
          console.log(`Error writing file: ${err}`);
        } else {
          console.log(`File is written successfully!`);
        }
      });
    }

    console.log(players_history);
  });
}

async function handleScores(player_ids) {
  // exit function if no players participated this week
  if (!player_ids.length) {
    return;
  }

  scores_file = "./data/scores.json";

  fs.readFile(scores_file, (err, data) => {
    if (err) {
      console.log(err);
    }

    var jsonParsed = JSON.parse(data);

    for (player in jsonParsed.players) {
      if (player_ids.includes(jsonParsed.players[player].id)) {
        jsonParsed.players[player].points += 1;
        jsonParsed.players[player].streak += 1;
      } else {
        jsonParsed.players[player].streak = 0;
      }
    }

    fs.writeFile(scores_file, JSON.stringify(jsonParsed), "utf8", (err) => {
      if (err) {
        console.log(`Error writing file: ${err}`);
      } else {
        console.log(`File is written successfully!`);
      }
    });
  });
}

function beginRegistration(derkscord) {
  console.log("Starting Studying Saturday registration phase...");

  // define variable for classroom channel
  const classroom = derkscord.channels.cache.get(classroom_channel_id);
  let participant_role = derkscord.roles.cache.find(
    (role) => role.name === "Participant"
  );
  let participant_role_id = participant_role.id;

  //const timerEmbed = new MessageEmbed().setTitle("old title");

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
        participate(user.id);
        participant_ids.push(user.id);
      });

      reactionCollector.on("end", (collected) => {
        console.log(`Total collected participants: ${collected.size}`);
        classroom.send("Registration is now closed.");
        //handleScores(participant_ids);
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

module.exports = {
  beginRegistration,
  beginStudy,
  assignRole,
  participate,
  handleScores,
};
