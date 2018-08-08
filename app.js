// Load up the discord.js library
const request = require("request");
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const Discord = require("discord.js");

mongoose.connect('mongodb://localhost/fortnite_discord_leaderboard');
mongoose.Promise = global.Promise;

const Schema = mongoose.Schema;
const LeaderboardSchema = new mongoose.Schema({
    _id: Number,
    name: String,
    players: [{
        name: String,
        platform: String,
        kills: Number,
        wins: Number
    }]
});

mongoose.model('Leaderboard', LeaderboardSchema);
var Leaderboard = mongoose.model('Leaderboard');


// This is your client. Some people call it `bot`, some people call it `self`, 
// some might call it `cootchie`. Either way, when you see `client.something`, or `bot.something`,
// this is what we're refering to. Your client.
const client = new Discord.Client();

// Here we load the config.json file that contains our token and our prefix values. 
const config = require("./config.json");
// config.token contains the bot's token
// config.prefix contains the message prefix.

client.on("ready", () => {
  // This event will run if the bot starts, and logs in, successfully.
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`); 
  // Example of changing the bot's playing game to something useful. `client.user` is what the
  // docs refer to as the "ClientUser".
//   client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on("guildCreate", guild => {
  // This event triggers when the bot joins a guild.
  Leaderboard.create({_id: guild.id, name: guild.name});
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
//   client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on("guildDelete", guild => {
  // this event triggers when the bot is removed from a guild.
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
//   client.user.setActivity(`Serving ${client.guilds.size} servers`);
});


client.on("message", async message => {
  // This event will run on every single message received, from any channel or DM.
  
  // It's good practice to ignore other bots. This also makes your bot ignore itself
  // and not get into a spam loop (we call that "botception").
  if(message.author.bot) return;
  
  // Also good practice to ignore any message that does not start with our prefix, 
  // which is set in the configuration file.
  if(message.content.indexOf(config.prefix) !== 0) return;
  
  // Here we separate our "command" name, and our "arguments" for the command. 
  // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
  // command = say
  // args = ["Is", "this", "the", "real", "life?"]
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
    
  if(command === "stats") {
    var channel = message.channel;
    if(args.length < 2 && (args[0] != "ps4" || args[0] != "xbl" || args[0] != "pc")) {
        message.channel.send("Invalid format. Example: '!stats ps4 nickmercs solo'");
    } else {
        const res = request({
            url: 'https://api.fortnitetracker.com/v1/profile/'+ args[0] + '/' + args[1],
            headers: {'TRN-Api-Key': 'c7f953e4-8b85-4ac0-a56b-c2a9c61b5a88'}
        }, (error, response, body) => {
            var stat = JSON.parse(body);
            if (stat.error) {
                channel.send("Error: " + stat.error);
            } else {
                if(args[2] == "solo") {
                    var message = "";
                    message += "Solo stats for " + stat.epicUserHandle + "\n";
                    message += "--------------------------------------------\n";
                    message += "Kills: " + stat.stats.p2.kills.value + "\n";
                    message += "Wins: " + stat.stats.p2.top1.value + "\n";
                    message += "K/D Ratio: " + stat.stats.p2.kd.value + "\n";
                    message += "Score: " + stat.stats.p2.score.value + "\n";
                    message += "Matches Played: " + stat.stats.p2.matches.value + "\n";
                    if(stat.stats.p2.winRatio) {
                        message += "Win Rate: " + stat.stats.p2.winRatio.value + "%\n";
                    }
                    message += "Top 3s: " + stat.stats.p2.top3.value + "\n";
                    channel.send(message)
                } else if (args[2] == "duo") {
                    var message = "";
                    message += "Duo stats for " + stat.epicUserHandle + "\n";
                    message += "--------------------------------------------\n";
                    message += "Kills: " + stat.stats.p10.kills.value + "\n";
                    message += "Wins: " + stat.stats.p10.top1.value + "\n";
                    message += "K/D Ratio: " + stat.stats.p10.kd.value + "\n";
                    message += "Score: " + stat.stats.p10.score.value + "\n";
                    message += "Matches Played: " + stat.stats.p10.matches.value + "\n";
                    if(stat.stats.p10.winRatio) {
                        message += "Win Rate: " + stat.stats.p10.winRatio.value + "%\n";
                    }
                    message += "Top 3s: " + stat.stats.p10.top3.value + "\n";
                    channel.send(message)
                } else if (args[2] == "squad") {
                    var message = "";
                    message += "Squad stats for " + stat.epicUserHandle + "\n";
                    message += "--------------------------------------------\n";
                    message += "Kills: " + stat.stats.p9.kills.value + "\n";
                    message += "Wins: " + stat.stats.p9.top1.value + "\n";
                    message += "K/D Ratio: " + stat.stats.p9.kd.value + "\n";
                    message += "Score: " + stat.stats.p9.score.value + "\n";
                    message += "Matches Played: " + stat.stats.p9.matches.value + "\n";
                    if(stat.stats.p9.winRatio) {
                        message += "Win Rate: " + stat.stats.p9.winRatio.value + "%\n";
                    }
                    message += "Top 3s: " + stat.stats.p9.top3.value + "\n";
                    channel.send(message)
                } else if (!args[2]) {
                    var message = "";
                    message += "Lifetime stats for " + stat.epicUserHandle + "\n";
                    message += "--------------------------------------------\n";
                    for(let i = 0; i < stat.lifeTimeStats.length; i++) {
                        message += stat.lifeTimeStats[i].key + ": " + stat.lifeTimeStats[i].value + "\n";
                    }
                    channel.send(message);
                } else {
                    channel.send("Invalid format. Example: '!stats ps4 nickmercs solo'");
                }
            }
        });
    }
  }

  if(command === "help") {
    var m = "";
    m += "Hi! I am a Fortnite Stat Tracker!\n\n";
    m += "Use !stats {ps4/pc/xbl} {epic name} {solo/duo/squad} to get your stats!\n\n";
    m += "Example: !stats pc 2xchampion duo\n\n";
    m += "Not passing in solo/duo/squad will get you your lifetime stats!\n\n";
    message.channel.send(m);
  }

  if(command === "leaderboard") {
    Leaderboard.findById(message.guild.id, (error, board) => {
        if(!board) {
            Leaderboard.create({_id: message.guild.id, name: message.guild.name});
            var l = ""
            l += "Leaderboard not found for this server. Creating one now...\n";
            l += "Leaderboard created. '!leaderboard add {ps4/xbl/pc} {epic name}' to add yourself to the leaderboard";
            message.channel.send(l);
        } else {
            if (args[0] == "add" && (args[1] == "ps4" || args[1] == "xbl" || args[1] == "pc")) {
                var ldr = board;
                const res = request({
                    url: 'https://api.fortnitetracker.com/v1/profile/'+ args[1] + '/' + args[2],
                    headers: {'TRN-Api-Key': 'c7f953e4-8b85-4ac0-a56b-c2a9c61b5a88'}
                }, (error, response, body) => {
                    var stat = JSON.parse(body);
                    if (stat.error) {
                        message.channel.send("Error: " + stat.error);
                    } else {
                        console.log("lol")
                        var result = board
                        result.players.push({name: stat.epicUserHandle, platform: args[1], kills: stat.lifeTimeStats[10].value, wins: stat.lifeTimeStats[8].value});
                        result.save();
                    }
                });
            } else {
                console.log(board)
                var m = "";
                m += "Leaderboard for " + board.name + "\n";
                m += "-----------------------------------\n";
                for(let i = 0; i < board.players.length; i++) {
                    m += "Name: " + board.players[i].name + " | Platform: " + board.players[i].platform + " | Kills: " + board.players[i].kills + " | Wins: " + board.players[i].wins + "\n";
                    m += "-----------------------------------\n";
                }
                message.channel.send(m);
            }
        }
    })
  }

  function shuffleArray(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }

});

client.login(config.token);
           