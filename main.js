import { Client, Collection, Events, GatewayIntentBits, EmbedBuilder } from "discord.js";
import { formatSavedList, indexSavedList, saveLatestPublicSuffixList } from "./utils.js";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import "dotenv/config";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});
client.commands = new Collection();

(async () => {
  const foldersPath = join(process.cwd(), "commands");
  const commandFolders = readdirSync(foldersPath);

  for (const folder of commandFolders) {
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

  const links = message.content.match(
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g
  );
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
