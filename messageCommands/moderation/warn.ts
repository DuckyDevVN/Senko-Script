import { EmbedBuilder, Message, PermissionFlagsBits } from "discord.js";
import ms from "ms";
import Nostal from "../../Nostal";
import { NostalMessageCommand } from "../../modules/command";
import { BaseExceptions, GuildExceptions } from "../../modules/exceptions";
import { Optional, Required } from "../../modules/usageArgumentTypes";

async function warnCommand(message: Message, type: string, targetId: string, ...args: string[]) {
    if (!message.member?.permissions.has(PermissionFlagsBits.ModerateMembers)) throw new GuildExceptions.NoPermissions();

    const nostal = message.client as Nostal;

    if (!type)
        // return message.reply({
        //     embeds: [
        //         new EmbedBuilder()
        //             .setColor(nostal.branding.embedColor)
        //             .setDescription(
        //                 `**Cú pháp**: \`?warn [list/remove] <user> [reason] {size}\`\n
        //                     \`[list]\` cho phép bạn xem danh sách cảnh cáo của thành viên
        //                     \`[remove]\` cho phép bạn xóa cảnh cáo của thành viên
        //                     \`<user>\` để bạn chọn thành viên cần thực hiện lệnh
        //                     \`[reason]\` cho phép bạn thêm lý do cảnh cáo nếu như bạn cảnh cáo thành viên
        //                     \`{size}\` để bạn chọn cảnh cáo hoặc số lượng cảnh cáo cần xóa nếu bạn sử dụng \`[remove]\`\n
        //                     **Lưu ý**: Không dùng một trong hai tùy chọn là \`[list]\` hoặc \`[remove]\` sẽ mặc định là cho thêm 1 cảnh cáo đối với thành viên cần thực hiện lệnh cảnh cáo. `
        //             )
        //             .setAuthor({
        //                 name: "Hướng dẫn sử dụng lệnh ?warn",
        //                 iconURL: nostal.user?.displayAvatarURL()
        //             })
        //     ]
        // }); just in case Anami needs it again
        throw new BaseExceptions.UserInputError("type/user");

    switch (type) {
        case "list": {
            if (!message.mentions.members?.first() && !targetId) throw new BaseExceptions.UserInputError("user/reason");
            if (isNaN(parseInt(targetId))) throw new BaseExceptions.UserError("userID phải là 1 số");

            const user = (
                message.mentions.members?.first() ||
                (await message.guild?.members.fetch(targetId).catch(() => {
                    throw new GuildExceptions.TargetNotFound();
                }))
            )?.user;

            if (!user) throw new GuildExceptions.TargetNotFound();

            const userData = await nostal.db.get(`${user.id}.${message.guild?.id}`);
            if (!userData) {
                nostal.db.set(`${user.id}.${message.guild?.id}`, { warns: [] });
                message.reply("Người này chưa từng bị cảnh cáo!");
                break;
            }
            if (userData.warns.length === 0) {
                message.reply("Người này chưa từng bị cảnh cáo!");
                break;
            }
            const warns = userData.warns.map((data: any, i: number) => ({
                name: `Warn#${i + 1}`,
                value: `> Bởi: <@${data.by}> \n> Lý do: ${data.reason}`
            }));
            message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(nostal.branding.embedColor)
                        .setAuthor({
                            name: `Lịch sử cảnh cáo của ${user?.username}`,
                            iconURL: user?.displayAvatarURL()
                        })
                        .addFields(...warns)
                ]
            });
            break;
        }

        case "remove": {
            if (!message.mentions.members?.first() && !targetId) throw new BaseExceptions.UserInputError("user/reason");
            if (isNaN(parseInt(targetId))) throw new BaseExceptions.UserError("userID phải là 1 số");

            const user = (
                message.mentions.members?.first() ||
                (await message.guild?.members.fetch(targetId).catch(() => {
                    throw new GuildExceptions.TargetNotFound();
                }))
            )?.user;
            const userData = await nostal.db.get(`${user?.id}`);
            if (!userData || userData.warns.length === 0) {
                message.reply("Người này chưa từng bị cảnh cáo!");
                break;
            }
            if (args[0].includes("-")) {
                const index: any = args[0].split("-");
                index.forEach((i: any) => {
                    if (isNaN(parseInt(i))) throw new BaseExceptions.UserError("size phải là 1 số");
                });
                index.sort((a: any, b: any) => {
                    return a - b;
                });
                userData.warns.splice(index[0] - 1, index[1] - index[0] + 1);
                message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(nostal.branding.embedColor)
                            .setDescription(`Đã xóa các lần warn từ **#${index[0]}** tới **#${index[1]}** của ${user?.tag}`)
                    ]
                });
            } else {
                const warns: any = args.slice(2);
                let index = "";
                let i = 1;
                warns.sort((a: any, b: any) => {
                    return a - b;
                });
                warns.forEach((w: any) => {
                    if (isNaN(parseInt(w))) throw new BaseExceptions.UserError("#Warn phải là 1 số");
                    userData.warns.splice(parseInt(w) - i, 1);
                    if (warns[warns.length - 1] === warns[warns.indexOf(w)]) return (index += `**#${w}**`);
                    index += `**#${w}**, `;
                    i++;
                });
                message.reply({
                    embeds: [
                        new EmbedBuilder().setColor(nostal.branding.embedColor).setDescription(`Đã xóa lần cảnh cáo thứ ${index} của ${user?.tag}`)
                    ]
                });
            }
            await nostal.db.set(`${user?.id}`, userData);
            break;
        }
        default: {
            if (!message.mentions.members?.first() && !type) throw new BaseExceptions.UserInputError("user/reason");
            if (isNaN(parseInt(type))) throw new BaseExceptions.UserError("userID phải là 1 số");

            const user = (
                message.mentions.members?.first() ||
                (await message.guild?.members.fetch(type).catch(() => {
                    throw new GuildExceptions.TargetNotFound();
                }))
            )?.user;
            const userData = await nostal.db.get(`${user?.id}`);
            const reason = targetId || "Không có lý do";
            if (!userData) {
                nostal.db.set(`${user?.id}`, {
                    userId: user?.id,
                    guildId: message.guildId,
                    warns: [
                        {
                            by: message.member.id,
                            reason: reason
                        }
                    ]
                });
            } else {
                userData.warns.push({
                    by: message.member.id,
                    reason: reason
                });
                await nostal.db.set(`${user?.id}`, userData);
            }

            message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(nostal.branding.embedColor)
                        .setAuthor({
                            name: `${user?.tag} đã bị cảnh cáo`,
                            iconURL: user?.displayAvatarURL()
                        })
                        .setDescription(`**Lý do**: ${reason}`)
                        .setTimestamp()
                ]
            });

            const member =
                message.mentions.members?.first() ||
                (await message.guild?.members.fetch(targetId).catch(() => {
                    throw new GuildExceptions.TargetNotFound();
                }));

            switch (userData?.warns.length) {
                case 3: {
                    member?.timeout(ms("1d"));
                    break;
                }
                case 5: {
                    member?.timeout(ms("3d"));
                    break;
                }
                case 8: {
                    member?.timeout(ms("7d"));
                    break;
                }
                case 10: {
                    member?.ban({ reason: "Đạt 10 lần warn" });
                    user?.send({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(nostal.branding.embedColor)
                                .setTitle(`Bạn đã bị ban ở server ${message.guild?.name}`)
                                .setDescription(`Bạn bị ban bởi <@${message.author.id}>`)
                                .addFields({
                                    name: "Lý do",
                                    value: reason
                                })
                                .setThumbnail(message.guild?.iconURL() || null)
                        ]
                    }).catch(() => {});
                    break;
                }
            }
            break;
        }
    }
}

export default new NostalMessageCommand({
    name: "warn",
    description: "Warn người dùng",
    category: "Moderation",
    usage: [Required("type/user"), Optional("user/reason"), Optional("size")],
    run: warnCommand
});
