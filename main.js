import { Client, Collection, Events, GatewayIntentBits, EmbedBuilder } from "discord.js";
import {
  formatSavedList,
  hashURL,
  indexSavedList,
  /*  saveLatestPublicSuffixList, */ URLCombinations,
} from "./utils.js";
// import { addIntoDB, getFromDB } from "./db-utils.js";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { resetCache, addIntoCache, checkInCache, removeFromCache } from "./cache-utils.js";
import "dotenv/config";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});
client.commands = new Collection();

(async () => {
  const foldersPath = join(process.cwd(), "commands");
  const commandFolders = readdirSync(foldersPath);

  for (const folder of commandFolders) {
    if (folder === "deploy-commands.js") return;

    const commandsPath = join(foldersPath, folder);
    const commandFiles = readdirSync(commandsPath).filter((file) => file.endsWith(".js"));

    for (const file of commandFiles) {
      const filePath = join(commandsPath, file);
      const commandModule = await import(filePath);

      if ("data" in commandModule && "execute" in commandModule) {
        client.commands.set(commandModule.data.name, commandModule);
      } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
      }
    }
  }
})();

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  if (message.content === "%%get") {
    // await saveLatestPublicSuffixList()
    //   .then(async () => {
    //     await message.channel.send("Saved suffixes to file.");
    //   })
    //   .catch(async (error) => {
    //     await message.channel.send(`Encountered an error: ${error}`);
    //   });

    return;
  }

  if (message.content === "%%format") {
    await formatSavedList();
  }

  if (message.content === "%%index") {
    const response = await indexSavedList();

    await message.channel.send("Done");
  }

  if (message.content === "%%hash") {
    const response = await hashURL("https://google.com").then(async (response) => {
      await message.channel.send(JSON.stringify(response));
    });
  }

  if (message.content === "%%resetcache") {
    const response = await resetCache();

    await message.channel.send("Done");
  }

  if (message.content === "%%addintocache") {
    await addIntoCache((await hashURL("https://google.com"))["16byte"]).catch((error) => console.error(error));

    await message.channel.send("Done");
  }

  if (message.content === "%%removefromcache") {
    await removeFromCache((await hashURL("https://google.com"))["16byte"]).then(async () => {
      await message.channel.send("Done");
    });
  }

  if (message.content === "%%checkcache") {
    await checkInCache((await hashURL("https://google.com"))["16byte"])
      .then(async (response) => {
        if (response) {
          await message.channel.send("In cache");
        } else {
          await message.channel.send("Not in cache");
        }
      })
      .catch((error) => console.error(error));
  }

  const links = message.content.match(
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g
  );

  if (message.content.startsWith("%%combinations")) {
    URLCombinations(links[0]);
  }

  if (links === null) return;

  const createEmbed = (link) =>
    new EmbedBuilder()
      .setTitle("⚠️ Suspicious link flagged")
      .setDescription(
        `Google Safe Browsing has flagged this link as suspicious.\n\`\`\`${link}\`\`\`\n\n**Read more about susicious links here**:\n- [Social Engineering](https://developers.google.com/search/docs/monitor-debug/security/social-engineering)\n- [Malware and Unwanted Software](https://developers.google.com/search/docs/monitor-debug/security/malware)`
      )
      .setTimestamp()
      .setFooter({
        text: "Note: This can not guarantee error-free results, the results may vary.",
      });

  links.forEach(async (link) => await message.channel.send({ embeds: [createEmbed(link)] }));
});

// client.on(Events.InteractionCreate, async (interaction) => {
//   if (!interaction.isChatInputCommand()) return;

//   const command = interaction.client.commands.get(interaction.commandName);
//   if (!command) return console.error(`No command matching ${interaction.commandName} was found.`);

//   try {
//     await command.execute(interaction);
//   } catch (error) {
//     console.error(error);

//     if (interaction.replied || interaction.deferred) {
//       await interaction.followUp({
//         content: "There was an error while executing this command!",
//         flags: MessageFlags.Ephemeral,
//       });
//     } else {
//       await interaction.reply({
//         content: "There was an error while executing this command!",
//         flags: MessageFlags.Ephemeral,
//       });
//     }
//   }
// });

client.login(process.env.DISCORD_TOKEN);
