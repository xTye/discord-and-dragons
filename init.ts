import { client } from "./index";
import { graph, playersCategory, general } from "./conts";

export function init() {
  const channel = client.channels.cache.get(playersCategory.id);
  const genChannel = client.channels.cache.get(general.id);
  if (!channel || !genChannel) return;

  if (genChannel.type === "GUILD_TEXT")
    general.channel = genChannel;
  
  if (channel.type === "GUILD_CATEGORY")
    playersCategory.channel = channel;

  if (playersCategory)
    [...playersCategory.channel.children].forEach(ch => {ch[1].delete()});

  for (const [key, value] of Object.entries(graph)) {
    const ch = client.channels.cache.get(value.id);
    if (!ch) return;
    if (ch.type === "GUILD_VOICE")
      value.setChannel = ch;
  }

  return playersCategory;
}