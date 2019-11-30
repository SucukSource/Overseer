const botconfig = require("./botconfig.json");
const tokenfile = require("./token.json");
const Discord = require("discord.js");
const fs = require("fs");
const bot = new Discord.Client({disableEveryone: true});
bot.commands = new Discord.Collection();
let coins = require("./commands/coins.json");

fs.readdir("./commands/", (err, files) => {

  if(err) console.log(err);

  let jsfile = files.filter(f => f.split(".").pop() === "js")
  if(jsfile.lenght <= 0){
    console.log("Couldn't find commands.");
    return;
  }

  jsfile.forEach((f, i) =>{
    let props = require(`./commands/${f}`);
    console.log(`${f} wurde geladen!`);
    bot.commands.set(props.help.name, props);
  });

});

bot.on("ready", async () => {
  console.log(`${bot.user.username} is online on ${bot.guilds.size} servers!`);
  bot.user.setPresence({ game: { name: 'g!help - Für Informationen', url: 'https://www.twitch.tv/discordapp', type: 1 } });
});

bot.on("guildMemberAdd", async (member, message) => {
  console.log(`${member.user.tag} hat den Server betreten.`);

  let welcomechannel = member.guild.channels.find(`name`, "willkommen");
  const embed = new Discord.RichEmbed()
  .setAuthor(message.guild.name, message.guild.iconURL)
  .setColor("#1bd677")
  .addField("+ ${member}", "Willkommen auf unserem Server!")
  welcomechannel.send(embed);
});
bot.on("guildCreate", async guild => {
  const embed = new Discord.RichEmbed()
  .setAuthor("Discord Overseer", bot.user.displayAvatarURL)
  .setColor("#1bd677")
  .setTitle("Danke für's Hinzufügen!")
  .addField("Kurze Einleitung für meine Benutzung", "Folgende Channel musst du erstellen, damit der Bot laufen kann: \nmodlog \nreports \nactionlog \nonews", true)
  guild.owner.send({embed});
});

bot.on("guildMemberRemove", async message => {

  console.log(`${member.user.tag} hat den Server verlassen.`);
  let welcomechannel = member.guild.channels.find(`name`, "willkommen");
  const embed = new Discord.RichEmbed()
  .setAuthor(message.guild.name, message.guild.iconURL)
  .setColor("#1bd677")
  .addField("- ${member}", "Viel Spaß noch weiterhin!")
  welcomechannel.send(embed);

});

bot.on("channelCreate", async channel => {
  console.log(`${channel.name} wurde erstellt.`);

  let sChannel = channel.guild.channels.find(`name`, "actionlog");
  const embed = new Discord.RichEmbed()
  .setAuthor("Discord Overseer")
  .setColor("#0x00ff00")
  .setTitle("Aktion: Channel erstellt")
  .setDescription(`Der Channel ${channel} (${channel.name}) wurde erstellt`)
  sChannel.send(embed);
});

bot.on("channelDelete", async channel => {
  console.log(`${channel.name} wurde gelöscht.`);

  let sChannel = channel.guild.channels.find(`name`, "actionlog");
  const embed = new Discord.RichEmbed()
  .setAuthor("Discord Overseer")
  .setColor("#0xff0000")
  .setTitle("Aktion: Channel gelöscht")
  .setDescription(`Der Channel ${channel.name} wurde gelöscht`)
  sChannel.send(embed);
});

bot.on("message", async message => {
  if(message.author.bot) return;
  if(message.channel.type === "dm") return;

  let prefixes = JSON.parse(fs.readFileSync("./prefixes.json", "utf8"));

  if(!prefixes[message.guild.id]){
    prefixes[message.guild.id] = {
      prefixes: botconfig.prefix
    };
  }


  let prefix = prefixes[message.guild.id].prefixes;
  //let prefix = botconfig.prefix;
  let messageArray = message.content.split(" ");
  let cmd = messageArray[0];
  let args = messageArray.slice(1);

  let commandfile = bot.commands.get(cmd.slice(prefix.length));
  if(commandfile) commandfile.run(bot,message,args);

});

bot.login(botconfig.token);
