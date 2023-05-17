import { EmbedBuilder, Message, PermissionFlagsBits } from "discord.js";

import Nostal from "Nostal";
import { NostalMessageCommand } from "modules/command";
import { BaseExceptions, GuildExceptions } from "modules/exceptions";
import { Optional, Required } from "modules/usageArgumentTypes";

async function unbanCommand(message: Message<true>, user?: string, ...args: string[]) {
    if (!message.member?.permissions.has(PermissionFlagsBits.BanMembers)) throw new GuildExceptions.NoPermissions();

    const nostal = message.client as Nostal;

    if (!user) throw new BaseExceptions.UserInputError("userID");

    if (!message.guild.members.me?.permissions.has(PermissionFlagsBits.BanMembers)) throw new GuildExceptions.BotHasNoPermissions();

    await message.guild.bans.remove(user, args.join(" ") || "Không có lý do");
    message.reply({
        embeds: [new EmbedBuilder().setColor(nostal.branding.embedColor).setDescription(`Đã Unban ${user} thành công`)]
    });
}

export default new NostalMessageCommand({
    name: "unban",
    description: "Unban người dùng",
    category: "Moderation",
    usage: [Required("userID"), Optional("reason")],
    run: unbanCommand
});
