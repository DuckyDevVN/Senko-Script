import { Message } from "discord.js";
import { afkLoader } from "handlers/afkLoader";
import { NostalMessageCommand } from "modules/command.js";
import Nostal from "Nostal";

async function afkCommand(message: Message, ...reason: string[]) {
    const nostal = message.client as Nostal;

    if (await nostal.db.get(`${message.author.id}.afk`)) {
        return await afkLoader(message, true);
    } else {
        await nostal.db.set(`${message.author.id}.afk`, reason.join(" ") || "khum có lí do");
        await message.member?.setNickname(`[AFK] ${message.member?.displayName}`);
        return message.reply({
            embeds: [
                {
                    description: `Đã set AFK cho bạn\nLí do: ${reason.join(" ") || "khum có lí do"}\nĐi nhớ sớm quay lại nha ♥♥♥`,
                    color: nostal.branding.embedColor
                }
            ]
        });
    }
}

export default new NostalMessageCommand({
    name: "afk",
    category: "misc",
    description: "Set or clear your AFK status",
    run: afkCommand
});
