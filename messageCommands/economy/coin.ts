import Nostal from "Nostal";
import { Message, userMention } from "discord.js";
import { NostalMessageCommand } from "modules/command.js";

interface Coin {
    bank: number;
    wallet: number;
}

async function coinCommand(message: Message) {
    const nostal = message.client as Nostal
    
    const coinUserData = await nostal.db.get(`${message.author.id}.economy.coin`) as Coin;
    if (!coinUserData) {
        await nostal.db.set(`${message.author.id}.economy.coin`, {
            bank: 0,
            wallet: 1
        });
    }

    message.reply({
        embeds: [
            {
                title: "Senko Coin của bạn.",
                thumbnail: { url: message.member?.displayAvatarURL() ?? "" },
                description: `${nostal.branding.emojis.wallet} Số coin trong túi: ${coinUserData?.wallet ?? 0} ${nostal.branding.emojis.coin}\n${nostal.branding.emojis.bank} Số coin trong ngân hàng: ${coinUserData?.bank ?? 0} ${nostal.branding.emojis.coin}`,
                color: nostal.branding.embedColor
            }
        ]
    })
}

export default new NostalMessageCommand({
    name: "coin",
    aliases: ["xemcoin", "coicuatoin", "xem_coin", "coin_cua_toi", "xemtien", "xem_tien"],
    category: "economy",
    description: "Xem số dư coin của bạn",
    run: coinCommand
});