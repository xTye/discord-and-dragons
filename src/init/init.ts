import { client } from "../index";
import { graph, playersCategory, general, GUILD_ID, PLAYER_ROLE_ID, help, CUSTOM_PLAYER_EMOJI } from "../lib/conts";
import { ChannelType } from "discord.js";
import { HelpUI } from "../hud/ui/help";

export async function init() {
  const guild = client.guilds.cache.get(GUILD_ID);

  if (guild) {
    const playerRole = guild.roles.cache.get(PLAYER_ROLE_ID);
    const members = playerRole?.members;

    if (members) {
      [...members.values()].forEach(async user => {
        await user.roles.remove(PLAYER_ROLE_ID);
      });
    }

    guild.emojis.cache.forEach(async (emoji, id) => {
      const ce = emoji.name?.split('_');
      if (ce && ce[0] === CUSTOM_PLAYER_EMOJI)
        await emoji.delete();
    });

  
    const channel = guild.channels.cache.get(playersCategory.id);
    const genChannel = guild.channels.cache.get(general.id);
    if (channel && genChannel) {
      if (genChannel.type === ChannelType.GuildText)
        general.channel = genChannel;
    
      if (channel.type === ChannelType.GuildCategory)
        playersCategory.channel = channel;

        if (playersCategory) {
          [...playersCategory.channel.children.cache].forEach(async ch => {
            await ch[1].delete();
          });
        }
    }
  
    if (help.load) {
      const tutorialChannel = client.channels.cache.get(help.id);
  
      if (tutorialChannel && tutorialChannel.isText()) {
        const messages = await tutorialChannel.messages.fetch();
        messages.forEach(async (message, id) => {
          await message.delete();
        });
        await tutorialChannel.send(HelpUI.genHelp());
      }
    }
  

    for (const [key, value] of Object.entries(graph)) {
      const ch = client.channels.cache.get(value.id);
      if (ch && ch.type === ChannelType.GuildStageVoice)
        value.setChannel(ch);
    }
  }
}