import { Message, SlashCommandBuilder } from "discord.js";
import { NostalMessageCommand } from "modules/command";
import Nostal from "Nostal";

// deploy slash commands
async function deployCommand(message: Message) {
    const nostal = message.client as Nostal;

    const guildID = message.content.split(" ")[1];

    const slashCommands: SlashCommandBuilder[] = [];
    nostal.slashCommands.forEach(slashCommand => slashCommands.push(slashCommand.data));

    if (guildID) {
        try {
            await nostal.application?.commands.set(slashCommands, guildID);
        } catch (error) {
            return await message.reply("Xin cái ID lmeo");
        }
    } else await nostal.application?.commands.set(slashCommands);

    await message.reply("Đã deploy slash commands");
}

export default new NostalMessageCommand({
    name: "deploy",
    category: "admin",
    description: "Deploy slash commands",
    ownerOnly: true,
    run: deployCommand
});
