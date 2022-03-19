function begin (derkscord) {
  console.log('Starting Studying Saturday event...');

  // define variable for classroom channel
  const classroom = derkscord.channels.cache.get(classroom_channel_id);

  classroom.send('Registration is now open! React with 🤓 to join today\'s session.').then(sent => { // 'sent' is the message just sent
    sent.react('🤓');
    const filter = (reaction, user) => {
	     return reaction.emoji.name === '🤓' && user.id !== sent.author.id;
    };

    const reactionCollector = sent.createReactionCollector({ filter, time: 6000 }); // 6s
    reactionCollector.on('collect', (reaction, user) => {
  	   console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
       // add Participant role to user
       let member = derkscord.members.cache.get(user.id);
       member.roles.add('954779034519224390');
       classroom.send(`<@${user.id}> joined!`)
    });
    reactionCollector.on('end', collected => {
  	   console.log(`Total collected participants: ${collected.size}`);
       classroom.send('Registration is now closed.');
    });


  }).catch(e => {
    console.log(e);
  });

} // end of function

module.exports = { begin };
