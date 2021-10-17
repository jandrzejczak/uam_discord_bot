import { ClientID, token, tokenSecret, secret, app_key } from "./config.js";
import * as Discord from "discord.js";
import axios from "axios";
import * as addOAuthInterceptor from "axios-oauth-1.0a";

//wtf are intents?
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });

var events = [];
var satEmbedEvents = [];
var sunEmbedEvents = [];

//When ready
client.on("ready", () => {
  console.log("reeeeady!");
});

client.on("messageCreate", async (message) => {
  if (message.content === "!plan") {
    var result = await USOS_get_calendar(0);
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
      .setDescription("Designed by	Bjarne Stroustrup")
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

function dateFormatter(date) {
  var utc = date.toJSON().slice(0, 10).replace(/-/g, "-");
  return utc;
}

function getDayName(dateStr) {
  var date = new Date(dateStr);
  date = date.toLocaleDateString("pl-PL", { weekday: "long" });
  date = date.charAt(0).toUpperCase() + date.slice(1);
  return date + ": ";
}

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

async function USOS_get_calendar(week) {
  events = [];
  satEmbedEvents = [];
  sunEmbedEvents = [];
  var date = new Date(new Date().getTime() + week * 24 * 60 * 60 * 1000);
  var utc = date.toJSON().slice(0, 10).replace(/-/g, "-");
  const client = axios.create();

  const options = {
    algorithm: "HMAC-SHA1",
    key: app_key,
    secret: secret,
    token: token,
    tokenSecret: tokenSecret,
  };
  addOAuthInterceptor.default.default(client, options);
  await client
    .get("https://usosapps.amu.edu.pl/services/tt/user?start=" + utc, {
      crossdomain: true,
    })
    .then((response) => {
      events = events.concat(response.data);
      const satDate = events[0].start_time.split(" ");
      events.forEach((element) => {
        var startDate = element.start_time.split(" ");
        var endDate = element.end_time.split(" ");
        var day = getDayName(startDate[0]);
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
