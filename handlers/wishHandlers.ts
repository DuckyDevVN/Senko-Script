import Nostal from "Nostal";
import { readFileSync } from "fs";
import { AttachmentBuilder, Message } from "discord.js";


export default async function(message: Message) {
    if (message.author.bot) return;
    if (!message.inGuild()) return;
    if (!message.channel.isTextBased()) return;

    const nostal = message.client as Nostal;

    if (message.mentions.users.first()?.id === nostal.user?.id) {
        if (message.content.toLocaleLowerCase().includes("buổi sáng")) {
            message.reply({
                content: `Chúc bạn có một buổi sáng vui vẻ ❤️❤️❤️`,
                files: [
                    new AttachmentBuilder(readFileSync("./assets/images/GA.jpeg"))
                ]
            })
            message.react(`💖`)
			message.react(`💝`)
			message.react(`💞`)
        }
        if (message.content.toLocaleLowerCase().includes("ngủ ngon")) {
            message.reply({
                content: `Chúc bạn ngủ ngon ❤️❤️❤️`,
                files: [
                    new AttachmentBuilder(readFileSync("./assets/images/GNM.jpeg"))
                ]
            })
            message.react(`💖`)
			message.react(`💝`)
			message.react(`💞`)
        }
        if (message.content.toLocaleLowerCase().includes("trưa")) {
            message.reply({
                content: `Chúc bạn buổi trưa vui vẻ ❤️❤️❤️`,
                files: [
                    new AttachmentBuilder(readFileSync("./assets/images/GAN.jpeg"))
                ]
            })
            message.react(`💖`)
			message.react(`💝`)
			message.react(`💞`)
        }
    }
}