import { Interaction, Message, ThreadChannel, codeBlock, inlineCode, userMention } from "discord.js";
import Nostal from "../Nostal";
import { BaseExceptions, GuildExceptions } from "../modules/exceptions";

export async function runMessageCommand(message: Message) {
    if (message.author.bot) return;
    if (!message.inGuild()) return;
    if (!message.channel.isTextBased()) return;

    const nostal = message.client as Nostal;
    const prefix = await nostal.getPrefix(message.guild.id);

    if (message.content == userMention(nostal.user!.id))
        return await message.reply(`Prefix của bot là ${inlineCode(await nostal.getPrefix(message.guild.id))} nhé :>`);

    if (!message.content.startsWith(prefix) && !message.content.startsWith(userMention(nostal.user!.id))) return;

    const [commandName, ...args] = message.content
        .slice(message.content.startsWith(prefix) ? prefix.length : userMention(nostal.user!.id).length)
        .trim()
        .split(/ +/g);

    if (!commandName) return;

    const command = nostal.messageCommands.get(commandName);
    if (!command) return;

    if (!nostal.owners.includes(message.author.id)) {
        if (command.ownerOnly) throw new GuildExceptions.NoPermissions();
        if (!nostal.managers.includes(message.author.id) && command.managerOnly) throw new GuildExceptions.NoPermissions();
    }

    if (!(message.channel instanceof ThreadChannel))
        if (command.nsfw && !message.channel.nsfw) return await message.reply("Đi qua cái channel nsfw sú sú kia rồi mới dùng lệnh này nhé :>");

    try {
        await command.run(message, ...args);
    } catch (error) {
        if (error instanceof BaseExceptions.UserInputError) {
            const commandUsage = command.usage.join(" ");
            return await message.reply({
                embeds: [
                    {
                        author: {
                            name: "Thiếu tham số",
                            icon_url: nostal.user!.displayAvatarURL()
                        },
                        description:
                            codeBlock(
                                `${prefix}${command.name} ${commandUsage}\n` +
                                    " ".repeat(`${prefix}${command.name} `.length + commandUsage.indexOf(error.parameter)) +
                                    "^".repeat(error.parameter.length)
                            ) + `Thiếu tham số ${inlineCode(error.parameter)}`,
                        color: nostal.branding.embedColor
                    }
                ]
            });
        }

        if (error instanceof BaseExceptions.UserError) {
            return await message.reply(error.message);
        }

        await message.reply("Có lỗi xảy ra khi chạy lệnh này :<");
        console.error(error);
    }
}

export async function runInteraction(interaction: Interaction) {
    if (!interaction.isChatInputCommand() && !interaction.isAutocomplete()) return;

    if (interaction.user.bot) return;

    const nostal = interaction.client as Nostal;
    const command = nostal.slashCommands.get(interaction.commandName);

    if (!command) return; // Cái này để check cho kỹ thoi chứ bth thì ko có thể dùng slash command mà ko có trong map

    if (interaction.isAutocomplete()) {
        if (!command.completion) return;

        if (!nostal.owners.includes(interaction.user.id)) {
            if (command.ownerOnly) return;
            if (!nostal.managers.includes(interaction.user.id) && command.managerOnly) return;
        }

        try {
            await command.completion(interaction);
        } catch (error) {
            console.error(error);
        }
    }

    if (interaction.isChatInputCommand()) {
        if (!nostal.owners.includes(interaction.user.id)) {
            if (command.ownerOnly) throw new GuildExceptions.NoPermissions();
            if (!nostal.managers.includes(interaction.user.id) && command.managerOnly) throw new GuildExceptions.NoPermissions();
        }

        try {
            await command.run(interaction);
        } catch (error) {
            if (error instanceof BaseExceptions.UserError) return await interaction.reply(error.message);

            await interaction.reply("Có lỗi xảy ra khi chạy lệnh này :<");
            console.error(error);
        }
    }
}
