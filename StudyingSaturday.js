const { MessageEmbed } = require("discord.js");
const fs = require("fs");

// Checks if a user_id is in the total player history in scores.json
// Adds a user_id to scores.json if they aren't already in it
async function participate(user_id) {
  scores_file = "./data/scores.json";

  // read scores.json
  fs.readFile(scores_file, (err, data) => {
    if (err) {
      console.log(err);
    }

    // initiate empty list to store all previous players' ids
    players_history = [];

    var jsonParsed = JSON.parse(data);

    // add every play from scores.json to the players_history list
    for (const player in jsonParsed.players) {
      players_history.push(jsonParsed.players[player].id);
    }

    // check if current participant is in the players_history list
    // add participant to scores.json if they aren't already in it
    if (!players_history.includes(user_id)) {
      jsonParsed.players.push({
        id: user_id,
        points: 0,
        streak: 0,
      });

      // overwrite scores.json with the new json data
      fs.writeFile(scores_file, JSON.stringify(jsonParsed), "utf8", (err) => {
        if (err) {
          console.log(`Error writing file during participate(): ${err}`);
        } else {
          console.log(`New user added to scores file`);
        }
      });
    }
  });
} // end of function

// Takes a list of participants' IDs and increments their points for
// participating, and handles their streaks
async function handleScores(player_ids) {
  // exit function if no players participated this week
  if (!player_ids.length) {
    return;
  }

  scores_file = "./data/scores.json";

  // read scores.json
  fs.readFile(scores_file, (err, data) => {
    if (err) {
      console.log(err);
    }

    var jsonParsed = JSON.parse(data);

    // Loop over every player in scores.json and check if they are in the
    // provided player_ids. If yes, give them a point and increment their
    // streak. If no, just reset their streak to 0.
    for (player in jsonParsed.players) {
      if (player_ids.includes(jsonParsed.players[player].id)) {
        jsonParsed.players[player].points += 1;
        jsonParsed.players[player].streak += 1;
      } else {
        jsonParsed.players[player].streak = 0;
      }
    }

    // overwrite scores.json with the new json data
    fs.writeFile(scores_file, JSON.stringify(jsonParsed), "utf8", (err) => {
      if (err) {
        console.log(`Error writing file during handleScores(): ${err}`);
      } else {
        console.log(`Scores and streaks updated`);
      }
    });
  });
} // end of function

//
function beginRegistration(derkscord) {
  console.log("Starting Studying Saturday registration phase...");

  // define variable for classroom channel
  const classroom = derkscord.channels.cache.get(classroom_channel_id);

  // fetch Participant role
  let participant_role = derkscord.roles.cache.find(
    (role) => role.name === "Participant"
  );
  let participant_role_id = participant_role.id;

  // send the registration react message in #classroom channel
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
        time: 595000,
      }); // 9m 55s duration

      // reaction collector which, upon receving a reaction:
      // - adds Participant role to user
      // - runs user's id through participate() function
      // - adds user's id to global participant_ids list for later use
      reactionCollector.on("collect", (reaction, user) => {
        console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);

        // add Participant role to user
        let member = derkscord.members.cache.get(user.id);
        member.roles.add(participant_role_id);
        classroom.send(`<@${user.id}> joined!`);
        // add user to scores.json if they aren't already in it
        participate(user.id);
        // add user to global participant_ids list
        participant_ids.push(user.id);
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

// Selects a random study topic from topics.txt and prompts all participants to
// begin researching.
function beginStudy(derkscord) {
  console.log("Starting Studying Saturday event...");

  // define variable for classroom channel
  const classroom = derkscord.channels.cache.get(classroom_channel_id);

  // read topics.txt into a list
  const readFileLines = (filename) =>
    fs.readFileSync(filename).toString("UTF8").split("\r\n");
  const topics = readFileLines("./data/topics.txt");
  // remove the last item from the list, because it's always an empty string
  topics.splice(-1, 1);
  // choose a random topic
  const x = Math.floor(topics.length * Math.random());

  classroom.send(
    `Today\'s topic is: **${topics[x]}**\nYou have 20 minutes to research this topic.\nGood luck! 🤓`
  );
} // end of function

// Adds Learner role to user
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
