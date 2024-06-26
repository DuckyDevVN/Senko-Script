import { ChatInputCommandInteraction, SlashCommandBuilder, inlineCode } from "discord.js";
import { NostalSlashCommand } from "modules/command";

async function pingCommand(interaction: ChatInputCommandInteraction) {
    await interaction.reply(`Pong! ${inlineCode(String(interaction.client.ws.ping))}ms`);
}

export default new NostalSlashCommand({
    data: new SlashCommandBuilder().setName("ping").setDescription("Bot lag thế nhở"),
    run: pingCommand
});
