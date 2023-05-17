import { Message, userMention } from "discord.js";
import { NostalMessageCommand } from "modules/command.js";
import axios from "axios";
import config from "config";
import createImage from "modules/images/createImage"

async function createImageCommad(message: Message, ...args: string[]) {
    const prompt = args.join(" ");
    
    const msg = await message.reply({
        content: "chờ xíu nha..."
    });

    message.channel.send({
        content: `${userMention(message.member?.id ?? "")} | ${prompt}`,
        files: [
            {
                attachment: await createImage(prompt)
            }
        ]
    })
    msg.delete();
}

export default new NostalMessageCommand({
    name: "image",
    aliases: ["img"],
    category: "AI",
    description: "Chuyển chữ sang hình ảnh",
    run: createImageCommad
});
