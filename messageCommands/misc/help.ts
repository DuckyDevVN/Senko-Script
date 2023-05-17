import { EmbedBuilder } from "@discordjs/builders";
import { inlineCode, Message } from "discord.js";
import { NostalMessageCommand } from "modules/command";
import { Optional } from "modules/usageArgumentTypes";
import Nostal from "Nostal";

async function helpCommand(message: Message<true>) {
    const nostal = message.client as Nostal;

    const commandName = message.content.split(" ")[1];
    if (commandName) {
        const command = nostal.messageCommands.get(commandName);
        if (!command) return message.reply("Command not found.");

        let commandUsage = "";

        const embed = new EmbedBuilder({
            title: inlineCode((await nostal.getPrefix(message.guild.id)) + command.name),
            description: command.description,
            color: nostal.branding.embedColor,
            fields: [
                {
                    name: "Category",
                    value: command.category ?? "None",
                    inline: true
                }
            ],
            footer: {
                text: `Requested by ${message.author.tag}`,
                icon_url: message.author.displayAvatarURL()
            }
        });

        if (command.aliases.length > 0) embed.addFields([{ name: "Aliases", value: command.aliases.join(", ") }]);

        if (command.usage.length > 0) command.usage.forEach(usage => (commandUsage += " " + usage.wrap[0] + usage.argument + usage.wrap[1]));
        embed.addFields([
            {
                name: "Usage",
                value: inlineCode((await nostal.getPrefix(message.guild.id)) + command.name + commandUsage)
            }
        ]);

        return message.reply({ embeds: [embed] });
    }

    // const categories = new Set();
    // for (const command of nostal.messageCommands.values())
    //     categories.add(command.category);

    await message.reply({
        embeds: [
            {
                title: "Help",
                description: `Use \`${await nostal.getPrefix(message.guild.id)}help <command>\` to get more information about a command.`,
                color: nostal.branding.embedColor
            }
        ]
    });
}

export default new NostalMessageCommand({
    name: "help",
    category: "misc",
    description: "Shows help",
    usage: [Optional("command")],
    run: helpCommand
});
