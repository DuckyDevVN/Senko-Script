import Nostal from "Nostal";
import { Message, PermissionFlagsBits, bold, inlineCode } from "discord.js";
import { NostalMessageCommand } from "modules/command";
import { BaseExceptions, GuildExceptions } from "modules/exceptions";
import { Optional, Required } from "modules/usageArgumentTypes";
import { secondsToTime } from "modules/utils";
import ms from "ms";

async function muteCommand(message: Message<true>, user?: string, time?: string, ...args: string[]) {
    if (!message.member?.permissions.has(PermissionFlagsBits.ModerateMembers)) throw new GuildExceptions.NoPermissions();

    const nostal = message.client as Nostal;

    if (!time) throw new BaseExceptions.UserInputError("time");

    if (isNaN(ms(time))) throw new BaseExceptions.UserError("Thời gian mute phải là 1 giá trị như 1s, 1m, 1h, 1d,...");

    if (!user)
        if (!message.mentions.members?.first()) throw new BaseExceptions.UserInputError("user");
        else user = message.mentions.members.first()!.user.id;

    const target = await message.guild.members.fetch(user);

    if (!target) throw new GuildExceptions.TargetNotFound();

    if (!message.guild.members.me?.permissions.has(PermissionFlagsBits.ModerateMembers)) throw new GuildExceptions.BotHasNoPermissions();

    if (target.user?.id === nostal.user?.id) throw new GuildExceptions.TargetIsSelf();
    if (target.user?.id === nostal.user?.id) throw new GuildExceptions.TargetIsAuthor();

    // all highest roles
    const authorRole = message.member.roles.highest.position;
    const targetRole = target.roles.highest.position;
    const botRole = message.guild.members.me.roles.highest.position;

    if (targetRole >= authorRole) throw new GuildExceptions.AuthorRoleIsLower();
    if (targetRole >= botRole) throw new GuildExceptions.BotRoleIsLower();

    await target.timeout(ms(time), args.join(" ") || "Không có lý do");

    message.reply({
        embeds: [
            {
                description: `${bold(target.user.tag)} đã bị mute trong vòng ${inlineCode(secondsToTime(ms(time) / 1000))}`,
                color: nostal.branding.embedColor
            }
        ]
    });
}

export default new NostalMessageCommand({
    name: "mute",
    description: "Mute 1 thành viên",
    category: "Moderation",
    usage: [Required("user"), Required("time"), Optional("reason")],
    run: muteCommand
});
