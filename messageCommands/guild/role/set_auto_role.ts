import Nostal from "Nostal";
import { Message, PermissionFlagsBits, roleMention } from "discord.js";
import { NostalMessageCommand } from "modules/command";
import { BaseExceptions, GuildExceptions } from "modules/exceptions";
import { Optional, Required } from "modules/usageArgumentTypes";

async function setAutoRole(message: Message, ...args: string[]) {
    if (!message.member?.permissions.has(PermissionFlagsBits.ManageRoles)) throw new GuildExceptions.NoPermissions();

    const nostal = message.client as Nostal;
    const role = message.mentions.roles.first();

    if (!args[0]) throw new BaseExceptions.UserInputError("list || add || rmv");

    if (!message.guild?.members.me?.permissions.has(PermissionFlagsBits.ManageRoles)) throw new GuildExceptions.BotHasNoPermissions();

    let authorHighestRole = message.member.roles.highest.position;
    let botHighestRole = message.guild.members.me.roles.highest.position;

    const guildData = (await nostal.db.get(`${message.guild.id}.auto.role`)) as string[];

    switch (args[0]) {
        case "add":
            if (!role) throw new BaseExceptions.UserInputError("role");
            let targetHighestRole = role.position;
            if (targetHighestRole >= authorHighestRole) throw new GuildExceptions.AuthorRoleIsLower();
            if (targetHighestRole >= botHighestRole) throw new GuildExceptions.BotRoleIsLower();

            if (!guildData) {
                nostal.db.set(`${message.guild.id}.auto.role`, [role.id]);
            } else {
                nostal.db.push(`${message.guild.id}.auto.role`, role.id);
            }
            message.reply({
                embeds: [
                    {
                        description: `Đã thêm ${roleMention(role.id)} vào danh sách vai trò tự động của server`,
                        color: nostal.branding.embedColor
                    }
                ]
            });
            break;
        case "rmv":
            if (!role) throw new BaseExceptions.UserInputError("role");
            if (!guildData) {
                message.reply({
                    embeds: [
                        {
                            description: `Hiện tại trong server không có bất kì một vai trò tự động nào`,
                            color: nostal.branding.embedColor
                        }
                    ]
                });
            } else {
                nostal.db.pull(`${message.guild.id}.auto.role`, role.id);
                message.reply({
                    embeds: [
                        {
                            description: `Đã loại ${roleMention(role.id)} ra khỏi danh sách vai trò tự động của server`,
                            color: nostal.branding.embedColor
                        }
                    ]
                });
            }
            break;

        default:
            if (!guildData) {
                message.reply({
                    embeds: [
                        {
                            description: `Hiện tại trong server không có bất kì một vai trò tự động nào`,
                            color: nostal.branding.embedColor
                        }
                    ]
                });
            } else {
                message.reply({
                    embeds: [
                        {
                            title: `Danh sách vai trò tự động của ${message.guild.name}`,
                            description: guildData.map(id => roleMention(id)).join("\n"),
                            color: nostal.branding.embedColor
                        }
                    ]
                });
            }
            break;
    }
}

export default new NostalMessageCommand({
    name: "autorole",
    aliases: ["atrole", "auto_role", "roletudong", "vaitrotudong", "vai_tro_tu_dong", "role_tu_dong"],
    description: "Thêm vai trò tự động",
    category: "Role",
    usage: [Optional("list || add || rmv"), Required("role")],
    run: setAutoRole
});
