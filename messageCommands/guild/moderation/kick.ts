import Nostal from "Nostal";
import { Message, PermissionFlagsBits } from "discord.js";
import { NostalMessageCommand } from "modules/command";
import { BaseExceptions, GuildExceptions } from "modules/exceptions";
import { Optional, Required } from "modules/usageArgumentTypes";

async function kickCommand(message: Message<true>, user?: string, ...args: string[]) {
    if (!message.member?.permissions.has(PermissionFlagsBits.KickMembers)) throw new GuildExceptions.NoPermissions();

    const nostal = message.client as Nostal;

    if (!user)
        if (!message.mentions.members?.first()) throw new BaseExceptions.UserInputError("user");
        else user = message.mentions.members.first()!.user.id;

    const target = await message.guild.members.fetch(user);
    if (!target) throw new GuildExceptions.TargetNotFound();
    if (!message.guild.members.me?.permissions.has(PermissionFlagsBits.KickMembers)) throw new GuildExceptions.BotHasNoPermissions();

    if (target.user.id === nostal.user?.id) throw new GuildExceptions.TargetIsSelf();

    let authorHighestRole = message.member.roles.highest.position;
    let targetHighestRole = target.roles.highest.position;
    let botHighestRole = message.guild.members.me.roles.highest.position;

    if (targetHighestRole >= authorHighestRole) throw new GuildExceptions.AuthorRoleIsLower();
    if (targetHighestRole >= botHighestRole) throw new GuildExceptions.BotRoleIsLower();

    const reason = args.join(" ");

    await target.kick(reason || "Không có lý do");
    message.reply({
        embeds: [
            {
                description: `Đã kick ${target.user.tag} thành công`,
                color: nostal.branding.embedColor
            }
        ]
    });

    target
        .send({
            embeds: [
                {
                    title: `Bạn đã bị kick ở server ${message.guild.name}`,
                    description: `Bạn đã bị kick ở server ${message.guild.name}`,
                    fields: [
                        {
                            name: "Lý do",
                            value: reason || "Không có lý do"
                        }
                    ],
                    color: nostal.branding.embedColor,
                    thumbnail: {
                        url: message.guild.iconURL() ?? ""
                    }
                }
            ]
        })
        .catch(() => message.reply("> Có vẻ như người dùng này đã đóng DMs, tôi không thể thông báo cho họ được"));
}

export default new NostalMessageCommand({
    name: "kick",
    description: "Kick người dùng",
    category: "Moderation",
    usage: [Required("user"), Optional("reason")],
    run: kickCommand
});
