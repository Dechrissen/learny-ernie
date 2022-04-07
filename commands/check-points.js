const BaseCommand = require("../BaseCommand.js");
const fs = require("fs");

class PointsCommand extends BaseCommand {
  constructor() {
    super();
    this.name = "points";
    this.description =
      "Tells the user how many participation points (PP) and streak points (SP) they currently have.";
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

      var user_points = jsonParsed.players.find(
        (player) => player.id == user_id
      ).points;

      var user_streak = jsonParsed.players.find(
        (player) => player.id == user_id
      ).streak;

      message.reply(`You have ${user_points} PP and ${user_streak} SP.`);
    });
  }
}

module.exports = PointsCommand;
