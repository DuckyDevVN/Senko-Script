import { channelMention, EmbedBuilder } from "@discordjs/builders";
import { GuildMember } from "discord.js";
import Nostal from "Nostal";

export default class WelcomeMessageEmbed extends EmbedBuilder {
    constructor(member: GuildMember) {
        super({
            author: {
                name: member.user.tag,
                icon_url: member.user.displayAvatarURL()
            },
            thumbnail: {
                url: "https://cdn.discordapp.com/attachments/1084007476309004318/1084007520152076288/icon.png"
            },
            title: "Chào mừng bạn đến với Nostal Horizon",
            description: `
                Trước khi tham gia giao lưu thì hãy đọc luật tại ${channelMention("1081901918458232932")} trước nhé.
                Cảm ơn đã tham gia và chúc bạn có trải nghiệm vui vẻ tại đây!
            `,
            color: (member.client as Nostal).branding.embedColor,
            image: { url: "attachment://welcome.png" },
            footer: {
                text: `Chúng ta đã có ${member.guild.memberCount} thành viên`
            },
            timestamp: new Date().toISOString()
        });
    }
}
