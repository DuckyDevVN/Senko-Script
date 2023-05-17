import { channelMention } from "@discordjs/builders";
import { Message } from "discord.js";
import { NostalMessageCommand } from "modules/command";
import Nostal from "Nostal";

async function getWelcomeChannelCommand(message: Message<true>) {
    const nostal = message.client as Nostal;

    const channelID = await nostal.db.get(message.guild.id + ".channel.welcome");

    if (!channelID)
        message.reply({
            embeds: [
                {
                    description: "Server này chưa có kênh chào mừng",
                    color: nostal.branding.embedColor
                }
            ]
        });

    await message.reply({
        embeds: [
            {
                description: `Kênh chào mừng của server này là ${channelMention(channelID)}`,
                color: nostal.branding.embedColor
            }
        ]
    });
}

export default new NostalMessageCommand({
    name: "getwelcomechannel",
    aliases: ["gwelcomechannel", "gwelcomec", "getwelcomec", "get_welcome_channel"],
    category: "guild",
    description: "Xem kênh chào mừng tại máy của bạn",
    run: getWelcomeChannelCommand
});
