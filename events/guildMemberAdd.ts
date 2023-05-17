import { Events, GuildMember, TextChannel, userMention } from "discord.js";
import NostalEvent from "modules/event";
import welcomeCard from "modules/images/welcomeCard";
import Nostal from "../Nostal";
import WelcomeMessageEmbed from "../modules/embeds/welcomeEmbed";

async function onGuildMemberAdd(member: GuildMember) {
    const nostal = member.client as Nostal;

    const welcomeChannelID: string | null = await nostal.db.get(`${member.guild.id}.channel.welcome`);
    const roleId: string[] | null = await nostal.db.get(`${member.guild.id}.auto.role`);

    if (roleId)
        roleId.forEach(async id => {
            const role = member.guild.roles.cache.get(id);
            if (!role) return;
            await member.roles.add(role);
        });

    if (!welcomeChannelID) return;

    const welcomeChannel = member.guild.channels.cache.get(welcomeChannelID) as TextChannel;

    if (!welcomeChannel) return;
    await welcomeChannel.send({
        content: `Chào ${userMention(member.id)}!`,
        embeds: [new WelcomeMessageEmbed(member)],
        files: [
            {
                attachment: await welcomeCard(member),
                name: "welcome.png"
            }
        ]
    });
}

export default new NostalEvent({
    eventName: Events.GuildMemberAdd,
    run: onGuildMemberAdd
});
