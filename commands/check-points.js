const BaseCommand = require("../BaseCommand.js");
const fs = require("fs");

class PointsCommand extends BaseCommand {
  constructor() {
    super();
    this.name = "points";
    this.description =
      "Tells the user how many Brain Points (BP) and Streak Points (SP) they currently have.";
  }
  execute(message, args) {
    let member = message.member;
    let user_id = member.id;
    let scores_file = "./data/scores.json";

    // read scores.json
    fs.readFile(scores_file, (err, data) => {
      if (err) {
        console.log(err);
      }

      var jsonParsed = JSON.parse(data);

      // try reading scores.json for user id; if it's not present, exit function
      try {
        var user_points = jsonParsed.players.find(
          (player) => player.id == user_id
        ).points;
        var user_streak = jsonParsed.players.find(
          (player) => player.id == user_id
        ).streak;
      } catch (error) {
        console.log("Error: User not in scores.json");
        message.reply(
          "No user data. Participate in **Studying Saturdays** every Saturday at 11 AM Eastern to accumulate Brain Points!"
        );
        return;
      }

      message.reply(`You have ${user_points} BP and ${user_streak} SP.`);
    });
  }
}

module.exports = PointsCommand;
