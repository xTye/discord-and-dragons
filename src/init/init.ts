import { client } from "../index";
import { graph, playersCategory, general, GUILD_ID, PLAYER_ROLE_ID } from "../lib/conts";
import { ChannelType } from "discord.js";

export function init() {
  const guild = client.guilds.cache.get(GUILD_ID);
  const playerRole = guild?.roles.cache.get(PLAYER_ROLE_ID);
  const members = playerRole?.members;
  if (!members) return;

  const channel = client.channels.cache.get(playersCategory.id);
  const genChannel = client.channels.cache.get(general.id);
  if (!channel || !genChannel) return;

  if (genChannel.type === ChannelType.GuildText)
    general.channel = genChannel;
  
  if (channel.type === ChannelType.GuildCategory)
    playersCategory.channel = channel;

  if (playersCategory)
    [...playersCategory.channel.children.cache].forEach(ch => {ch[1].delete()});

  [...members.values()].forEach(user => {
    user.roles.remove(PLAYER_ROLE_ID);
  });

  for (const [key, value] of Object.entries(graph)) {
    const ch = client.channels.cache.get(value.id);
    if (!ch) return;
    if (ch.type === ChannelType.GuildStageVoice)
      value.setChannel(ch);
  }

  return playersCategory;
}