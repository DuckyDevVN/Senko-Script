import Nostal from "Nostal";
import { Message, PermissionsBitField, TextChannel, channelMention } from "discord.js";
import { NostalMessageCommand } from "modules/command.js";
import { GuildExceptions } from "modules/exceptions/index.js";
import { Optional } from "modules/usageArgumentTypes.js";

async function setWishChannelCommand(message: Message<true>) {
    const nostal = message.client as Nostal;

    if (!message.member?.permissions.has(PermissionsBitField.Flags.ManageGuild)) throw new GuildExceptions.NoPermissions();

    const channelID = message.mentions.channels.first() as TextChannel;
    if (!channelID) {
        if (await nostal.db.get(`${message.guild.id}.channel.wish`)) {
            await nostal.db.delete(`${message.guild.id}.channel.wish`);
            return await message.reply({
                embeds: [
                    {
                        description: `Đã bỏ chọn ${channelMention(await nostal.db.get(`${message.guild.id}.channel.wish`))} là kênh chúc`,
                        color: nostal.branding.embedColor
                    }
                ]
            });
        }
        message.reply({
            embeds: [
                {
                    description: `Server này chưa có kênh chúc`,
                    color: nostal.branding.embedColor
                }
            ]
        });
    }

    // TODO: check if channelID exists

    await nostal.db.set(`${message.guild.id}.channel.wish`, channelID.id);
    await message.reply({
        embeds: [
            {
                description: `Đã chọn ${channelMention(channelID.id)} là kênh chúc`,
                color: nostal.branding.embedColor
            }
        ]
    });
}

export default new NostalMessageCommand({
    name: "setwishchannel",
    aliases: ["swishchannel", "setwish", "wishchannel"],
    category: "guild",
    description: "Chọn kênh để bot chúc cho máy chủ của bạn",
    usage: [Optional("channel")],
    run: setWishChannelCommand
});
