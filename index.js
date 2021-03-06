import { ClientID, token, tokenSecret, secret, app_key, bot_channel } from "./config.js";
import * as Discord from "discord.js";
import axios from "axios";
import * as addOAuthInterceptor from "axios-oauth-1.0a";
// import * as _ from "lodash";
import _ from "lodash";
// var _ = require('lodash');

//wtf are intents?
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });

var events = [];
var tempEvents = [];
var satEmbedEvents = [];
var sunEmbedEvents = [];

var today = new Date(new Date().getTime());
var tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);

//When ready
client.on("ready", () => {
  console.log("reeeeady!");
});

//React to user messages
client.on("messageCreate", async (message) => {
  if (message.content === "!plan") {
    // var result = await USOS_get_calendar(0);
    const timeTable = createEmbed(satEmbedEvents, sunEmbedEvents);
    message.channel.send({ embeds: [timeTable] });
  }
  if (
    message.content === "ciężko jest" ||
    message.content === "cięzko jest" ||
    message.content === "cieżko jest" ||
    message.content === "ciezko jest"
  ) {
    message.reply("<:monkaS:898863101972217857> no jest jest");
  }
  if (
    message.content ===
    "mi sie wydaje ze ma wikipedie odpaloną na drugim ekranie"
  ) {
    message.reply("xd no mi tez");
  }
  if (message.content === "c++ release date") {
    var embed = new Discord.MessageEmbed()
      .setColor("#42d4f5")
      .setTitle("1985")
      .setDescription("Designed by Bjarne Stroustrup")
      .setThumbnail(
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/ISO_C%2B%2B_Logo.svg/1024px-ISO_C%2B%2B_Logo.svg.png"
      )
      .addFields({
        name: "Developer",
        value:
          "ISO/IEC JTC1 (Joint Technical Committee 1) / SC22 (Subcommittee 22) / WG21 (Working Group 21)",
      });
    message.reply({ embeds: [embed] });
  }
  if (message.content === "c release date") {
    var embed = new Discord.MessageEmbed()
      .setColor("#42d4f5")
      .setTitle("1972")
      .setDescription("C (programming language)")
      .setThumbnail(
        "https://i.pinimg.com/originals/6e/46/e7/6e46e7dbe2bb73dacc055e5dbd85c3ad.png"
      )
      .addFields({
        name: "Developer",
        value:
          "Dennis Ritchie & Bell Labs (creators); ANSI X3J11 (ANSI C); ISO/IEC JTC1/SC22/WG14 (ISO C)",
      });
    message.reply({ embeds: [embed] });
  }
});

client.login(ClientID);

//Functions

//Format date for USOS API
function dateFormatter(date) {
  var utc = date.toJSON().slice(0, 10).replace(/-/g, "-");
  return utc;
}

//Check weekday name
function getDayName(dateStr) {
  var date = new Date(dateStr);
  date = date.toLocaleDateString("pl-PL", { weekday: "long" });
  date = date.charAt(0).toUpperCase() + date.slice(1);
  return date + ": ";
}

//Generate flashy embed (nice)
function createEmbed(satEmbedEvents, sunEmbedEvents) {
  var embed = new Discord.MessageEmbed()
    .setColor("#0099ff")
    .setTitle("Plan zajęć na tydzień:")
    .setDescription(
      "od: " +
        dateFormatter(new Date(new Date().getTime())) +
        " do: " +
        dateFormatter(new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000))
    )
    .setThumbnail(
      "https://siw.amu.edu.pl/__data/assets/file/0005/162752/logo_wersja-uzupeniajca_czarny_2.jpg"
    )
    .addFields(
      { name: "\u200B", value: satEmbedEvents[0].date },
      satEmbedEvents,
      { name: "\u200B", value: sunEmbedEvents[0].date },
      sunEmbedEvents
    )
    .setFooter("UAM - niestacjonarnie");

  return embed;
}

//Get timetable from USOS API
async function USOS_get_calendar(week) {
  // events = [];

  //satEmbed and sunEmbed needs to be removed for better support
  satEmbedEvents = [];
  sunEmbedEvents = [];
  var date = new Date(new Date().getTime() + week * 24 * 60 * 60 * 1000);
  var utc = date.toJSON().slice(0, 10).replace(/-/g, "-");
  const client = axios.create();

  //OAuth interceptor options for axios
  const options = {
    algorithm: "HMAC-SHA1",
    key: app_key,
    secret: secret,
    token: token,
    tokenSecret: tokenSecret,
  };
  //Some fucked up shit idk why
  addOAuthInterceptor.default.default(client, options);
  await client
    .get("https://usosapps.amu.edu.pl/services/tt/user?start=" + utc, {
      crossdomain: true,
    })
    .then((response) => {
      events = response.data;
      const satDate = events[0].start_time.split(" ");
      events.forEach((element) => {
        var startDate = element.start_time.split(" ");
        var endDate = element.end_time.split(" ");
        // var day = getDayName(startDate[0]);
        if (startDate[0] === satDate[0]) {
          var obj = {};
          obj["date"] = getDayName(startDate[0]);
          obj["name"] = element.name.pl;
          obj["value"] =
            startDate[1].slice(0, 5) + " — " + endDate[1].slice(0, 5);
          satEmbedEvents.push(obj);
        } else {
          var obj = {};
          obj["date"] = getDayName(startDate[0]);
          obj["name"] = element.name.pl;
          obj["value"] =
            startDate[1].slice(0, 5) + " — " + endDate[1].slice(0, 5);
          sunEmbedEvents.push(obj);
        }
      });
    })
    .catch((error) => {
      throw error;
    });
}

//Check for time table changes
const checkCalendarChanged = async () => {
  try {
    await USOS_get_calendar(0);
    today = new Date(new Date().getTime());

    if (today.getDate() != tomorrow.getDate()) {
      if (tempEvents.length === 0) {
        console.log("puste");
        tempEvents = events;
      } else if (_.isEqual(events, tempEvents)) {
        console.log("Time tables are equal.");
      } else {
        tempEvents = events;
        //Send message to specific bot channel
        const channel = client.channels.cache.find(
          (channel) => channel.name === bot_channel
        );
        channel.send("Wprowadzono aktualizacje planu!");
      }
    } else {
      tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
      tempEvents = events;
    }
  } catch (err) {
    console.error(err);
  }
};

//Check every hour for changes
setInterval(checkCalendarChanged, 60 * 60 * 1000);
// setInterval(checkCalendarChanged, 1000);
