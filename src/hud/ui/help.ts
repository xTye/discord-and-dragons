import { EmbedBuilder } from "@discordjs/builders";
import { ActionRowBuilder, APIEmbedField, ButtonBuilder, ButtonStyle, MessageActionRowComponentBuilder, MessageOptions, Snowflake } from "discord.js";
import { GameUI } from ".";
import { game } from "../..";
import { HELP_GIF } from "../../lib/conts";

export class HelpUI extends GameUI {
  constructor(id: Snowflake) {
      super(id);

      this.embed.setTitle("Help")
        .setThumbnail(HELP_GIF);

      const cancelButton = this.createButton(
        "/player sync",
        "Cancel",
        ButtonStyle.Danger,
        { name: "redcross", id: "758380151238033419" },
      );

      this.addActionRow(cancelButton);
    }

  static ready(): APIEmbedField {
    return {
      name: "Ready",
      value:
      "[1] Map: Load the map UI to view the locations with descriptions\n" +
      "[2] Ready: Ready up to play the game. Game can be started only when all players are ready\n" +
      "",
    };
  }

  static search(): APIEmbedField {
    return {
      name: "Search",
      value:
      "[1] Map: Load the map UI to view the locations with descriptions\n" +
      "[2] Ready: Ready up to play the game. Game can be started only when all players are ready\n" +
      "",
    };
  }

  static vote(): APIEmbedField {
    return {
      name: "Vote",
      value:
      "[1] Map: Load the map UI to view the locations with descriptions\n" +
      "[2] Ready: Ready up to play the game. Game can be started only when all players are ready\n" +
      "",
    };
  }

  static activity(): APIEmbedField {
    return {
      name: "Activity",
      value:
      "[1] Map: Load the map UI to view the locations with descriptions\n" +
      "[2] Ready: Ready up to play the game. Game can be started only when all players are ready\n" +
      "",
    };
  }


  static genHelp(): MessageOptions {
    const tutorial = new EmbedBuilder()
      .setTitle("Tutorial")
      .setDescription("Here is a list of help options at different states in the game. Refer to the image below and the corresponding rows to learn more.")
      .setThumbnail(HELP_GIF)

    tutorial.addFields(
      this.whiteSpace(),
      this.ready(),
      this.whiteSpace(),
      this.search(),
      this.whiteSpace(),
      this.vote(),
      this.whiteSpace(),
      this.activity(),
      this.whiteSpace(),
    );

    const joinButton = new ButtonBuilder()
      .setCustomId("/player join")
      .setLabel("Join")
      .setStyle(ButtonStyle.Success)
      .setEmoji("✔️");
    
    const syncButton = new ButtonBuilder()
      .setCustomId("/player sync voice:yes")
      .setLabel("Sync")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("♻️");

    const leaveButton = new ButtonBuilder()
      .setCustomId("/player leave")
      .setLabel("Leave")
      .setStyle(ButtonStyle.Danger)
      .setEmoji("🗑");

    const row = new ActionRowBuilder<MessageActionRowComponentBuilder>()
      .addComponents([joinButton, syncButton, leaveButton]);
    
    return { embeds: [tutorial], components: [row] };
  }

  loadSync() {
    this.embed.setTitle("Uh oh!")
      .setDescription("Something, catastrophic happened between your voice and our world. Click the sync button to try to connect to voice chat again, or ignore it and go #stealthmode");

    const syncButton = new ButtonBuilder()
      .setCustomId("/player sync voice:yes")
      .setLabel("Sync")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("♻️");

    const leaveButton = new ButtonBuilder()
      .setCustomId("/player sync")
      .setLabel("")
      .setStyle(ButtonStyle.Danger)
      .setEmoji("🗑");

    this.addActionRow(syncButton, leaveButton);
  }

  override load() {
    this.clearFields();

    if (game.state === GameStateType.READY) {
      this.addFields(
        HelpUI.ready(),
      );
    }

    else if (game.state === GameStateType.SEARCH) {
      this.addFields(
        HelpUI.search(),
        GameUI.whiteSpace(),
        HelpUI.activity(),
      );
    }

    else if (game.state === GameStateType.VOTE) {
      this.addFields(
        HelpUI.ready(),
      );
    }
  }
}