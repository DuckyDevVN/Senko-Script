import { Message, PermissionFlagsBits, userMention } from "discord.js";

import Nostal from "Nostal";
import { NostalMessageCommand } from "modules/command.js";
import { BaseExceptions, GuildExceptions } from "modules/exceptions";
import { Optional, Required } from "modules/usageArgumentTypes";

async function banCommand(message: Message<true>, user?: string, ...args: string[]) {
    if (!message.member?.permissions.has(PermissionFlagsBits.BanMembers)) throw new GuildExceptions.NoPermissions();

    const nostal = message.client as Nostal;

    if (!user) throw new BaseExceptions.UserInputError("user");

    const target =
        message.mentions.members?.first() ??
        (await message.guild.members.fetch(user).catch(() => {
            throw new GuildExceptions.TargetNotFound();
        }));

    if (!target) throw new GuildExceptions.TargetNotFound();

    if (!message.guild.members.me?.permissions.has(PermissionFlagsBits.BanMembers)) throw new GuildExceptions.BotHasNoPermissions();

    if (target.user?.id === nostal.user?.id) throw new GuildExceptions.TargetIsSelf();
    if (target.user?.id === message.author.id) throw new GuildExceptions.TargetIsAuthor();

    // all highest roles
    const authorRole = message.member.roles.highest.position;
    const targetRole = target.roles.highest.position;
    const botRole = message.guild.members.me.roles.highest.position;

    if (targetRole >= authorRole) throw new GuildExceptions.AuthorRoleIsLower();
    if (targetRole >= botRole) throw new GuildExceptions.BotRoleIsLower();

    const reason = args.join(" ");

    await target.ban({ reason: reason });

    message.reply({
        embeds: [
            {
                description: `Đã Ban ${target.user.tag} thành công`,
                color: nostal.branding.embedColor
            }
        ]
    });

    target
        .send({
            embeds: [
                {
                    title: `Bạn đã bị ban ở server ${message.guild.name}`,
                    description: `Bạn bị ban bởi ${userMention(message.member.user.id)}`,
                    color: nostal.branding.embedColor,
                    fields: [
                        {
                            name: "Lý do",
                            value: reason || "Không có lý do"
                        }
                    ],
                    thumbnail: {
                        url: message.guild.iconURL() ?? ""
                    }
                }
            ]
        })
        .catch(() =>
            message.reply({
                content: "> Có vẻ như người dùng này đã đóng DMs, tôi không thể thông báo cho họ được"
            })
        );
}

export default new NostalMessageCommand({
    name: "ban",
    description: "Ban người dùng",
    category: "Moderation",
    usage: [Required("user"), Optional("reason")],
    run: banCommand
});
