import { ActionRowBuilder, ButtonStyle, CommandInteraction, ModalBuilder, Snowflake, TextInputBuilder, TextInputStyle } from "discord.js";
import { GameUI } from ".";
import { GameActivity } from "../../activities";
import { Fish } from "../../activities/fish";
import { PrisonersDilemma } from "../../activities/prisoners-dilemma";
import { SikeDilemma } from "../../activities/sike-dilemma";
import { Player } from "../../player";

export class ActivityUI extends GameUI {
  player: Player;
  activity: GameActivity;

  constructor(id: Snowflake, player: Player, activity: GameActivity) {
    super(id);
    
    this.player = player;
    this.activity = activity;

    this.loadActivityUI();
  }

  loadActivityUI() {
    if (this.player.location.activity)
      this.embed = this.player.location.activity.embed;

    this.loadTimers();
    
    this.load();
  }

  override load() {
    this.clearActionRows();

    if (this.player.location.activity instanceof Fish) {
      this.loadFish();
    } else if (this.player.location.activity instanceof PrisonersDilemma) {
      this.loadPrisonersDilemma();
    } else if (this.player.location.activity instanceof SikeDilemma) {
      this.loadSikeDilemma();
    } else {

      const cancelButton = this.createButton(
        "/player state select:sync_message",
        "Cancel",
        ButtonStyle.Danger,
        { name: "redcross", id: "758380151238033419" },
      );
  
      this.addActionRow(cancelButton);

    }
  }

  loadFish() {
    const fishButton = this.createButton(
      "/player activity select:join",
      "Fish",
      this.player.active ? ButtonStyle.Secondary : ButtonStyle.Primary,
      "🎣",
      this.player.active ? true : false,
    );

    const rockButton = this.createButton(
      "/player activity select:rock",
      "Throw Rock",
      this.player.active ? ButtonStyle.Secondary : ButtonStyle.Primary,
      { name: "rock", id: "1007147881431568484" },
      this.player.active ? true : false,
    );

    const cancelButton = this.createButton(
      "/player state select:sync_message",
      "Cancel",
      ButtonStyle.Danger,
      { name: "redcross", id: "758380151238033419" },
    )

    this.addActionRow(fishButton, rockButton, cancelButton);
  }

  loadPrisonersDilemma() {
    const voteButton = this.createButton(
      "/player activity select:vote_load",
      "Vote",
      this.player.active ? ButtonStyle.Primary : ButtonStyle.Secondary,
      "📝",
      this.player.active ? false : true,
    );

    const cancelButton = this.createButton(
      "/player state select:sync_message",
      "Cancel",
      ButtonStyle.Danger,
      { name: "redcross", id: "758380151238033419" },
    )

    this.addActionRow(voteButton, cancelButton);
  }

  loadSikeDilemma() {
    if (!this.activity.done) {
      const joinHelpeeButton = this.createButton(
        "/player activity select:join",
        "Helpee",
        this.player.active ? ButtonStyle.Secondary : ButtonStyle.Primary,
        "🤞",
        this.player.active ? true : false,
      );
  
      const joinHelperButton = this.createButton(
        "/player activity select:rock",
        "Helper",
        this.player.active ? ButtonStyle.Secondary : ButtonStyle.Primary,
        "🤎",
        this.player.active ? true : false,
      );

      const leaveButton = this.createButton(
        "/player activity select:leave",
        "Leave",
        this.player.active ? ButtonStyle.Danger : ButtonStyle.Secondary,
        "🚶",
        this.player.active ? false : true,
      );

      this.addActionRow(joinHelpeeButton, joinHelperButton, leaveButton);
    }
    
    const voteButton = this.createButton(
      "/player activity select:vote_load",
      "Vote",
      this.player.active ? ButtonStyle.Primary : ButtonStyle.Secondary,
      "📝",
      this.player.active ? false : true,
    );

    const cancelButton = this.createButton(
      "/player state select:sync_message",
      "Cancel",
      ButtonStyle.Danger,
      { name: "redcross", id: "758380151238033419" },
    )

    this.addActionRow(voteButton, cancelButton);
  }

  loadActivityUpdate(message: string | null) {
    if (message)
      this.embed.setDescription(`\`${message}\``);
    else
      this.embed.setDescription(message);
    
    this.load();
  }

  async loadActivityModal(interaction: CommandInteraction) {
    const textIn = new TextInputBuilder()
      .setStyle(TextInputStyle.Short)
      .setLabel("Destroy your enemies...")
      .setRequired(true)
      .setCustomId("vote")
      .setPlaceholder("'yes'|'y'|'1' for yes, anything else for no.")
      .setMinLength(1)
      .setMaxLength(3)

    const rows: ActionRowBuilder<TextInputBuilder> = new ActionRowBuilder({ components: [textIn] });

    const modal = new ModalBuilder()
      .setTitle("Vote")
      .setCustomId("/player activity select:vote")
      .addComponents(rows)

    await interaction.showModal(modal);
  }
}