# Learny Ernie

<p align="center"><img style="width:12%" src="https://github.com/Dechrissen/learny-ernie/blob/master/assets/ernie.png" alt="Learny Ernie icon"></img></p>

## Background

Learny Ernie is a Discord bot & the host of **Studying Saturdays with Learny Ernie**, a weekly event that takes place on Saturdays in [my Discord server](https://discord.gg/SB52VWvwRY). His purpose is to motivate learning by selecting a random topic from a list of topics, and organize an hour-long group studying/learning event where participants are asked to:

- research the topic
- write a short paragraph about it
- post it in the channel for other participants to read
- and discuss with the other participants about the topic

<p align="center"><img style="width:50%" src="https://github.com/Dechrissen/learny-ernie/blob/master/assets/studying-saturdays-logo.png" alt="Studying Saturdays logo"></img></p>

## How it works

A quick breakdown of Learny Ernie's schedule (on Saturdays):

- 10:50 AM : He posts a "10 minutes until Studying Saturdays" reminder, pinging those who have the @Learner role. At this point, users must react to the message with the nerd emoji if they wish to participate. They will receive the @Participant role for the duration of the event.
- 11:00 AM : He closes the registration window and begins the event. A random topic is selected from the list and all Participants will be asked to research the topic.
- 11:20 AM : He posts a message signaling the end of the studying phase, and the start of the writing phase. Participants must write a short paragraph about their understanding of the topic.
- 11:30 AM : He posts a message signaling the end of the writing phase, and the start of the discussion phase. Participants must post their paragraphs and casually discuss with the group, to solidify learning.
- 12:00 PM : He will announce the end of the event and close the channel until the following Saturday.

## Points & streaks

All participants will earn 1 Brain Point (BP) for attending the event. For every week a particular player participates in a row, they will build Streak Points (SP).

## Running Ernie as a service

- TODO: add how to set up init.d service here
- To start: `sudo /etc/init.d/ernie start`
- To stop: `sudo /etc/init.d/ernie stop`
