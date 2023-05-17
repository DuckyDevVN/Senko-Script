import { Interaction, Message, ThreadChannel, codeBlock, inlineCode, userMention, AttachmentBuilder, User } from "discord.js";
import Nostal from "../Nostal";
import { BaseExceptions, GuildExceptions } from "../modules/exceptions";
import { readFileSync } from "fs";
import config from "config";

export async function afkLoader(message : Message, isCommand? : boolean) {
    
    const nostal = message.client as Nostal;
    if (message.author.bot || !message.guild) return;

    if (message.mentions.users) {
        const member =  message.mentions.users.first();
        const afkData = await nostal.db.get(`${member?.id}.afk`)
        if (afkData) {
            message.reply({
                embeds: [
                    {
                        description: `${userMention(member?.id ?? "")} hiện đang khum có mặt ở đây vì lí do là: \n${afkData} `,
                        color: config.branding.embedColor
                    }
                ]
            })
        }
    }

    if (message.content.startsWith(`${config.bot.prefix}afk`) && !isCommand) return;

    const afkData = await nostal.db.get(`${message.author.id}.afk`);

    if (!afkData) return;
    await nostal.db.delete(`${message.author.id}.afk`);

    await message.member?.setNickname(message.member.displayName.slice("[AFK] ".length));

    return message.reply({
        embeds: [
            {
                description: `Chào mừng ${userMention(message.author.id)} đã quay trở lại, mình rất vui đc gặp lại bạn ♥♥♥`,
                author: { icon_url: message.member?.displayAvatarURL(), name: message.member?.displayName ?? "" },
                image: {
                    url: "attachment://image.png",
                }
            }
        ],
        files: [
            new AttachmentBuilder(readFileSync("./assets/images/AFK.jpg"), {name: "image.png"})
        ]
    })
}