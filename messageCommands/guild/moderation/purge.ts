import Nostal from "Nostal";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, GuildChannel, Message, PermissionFlagsBits } from "discord.js";

import { NostalMessageCommand } from "modules/command";
import { BaseExceptions, GuildExceptions } from "modules/exceptions";
import { Required } from "modules/usageArgumentTypes";

async function purgeCommand(message: Message<true>, count?: string) {
    if (!message.member?.permissions.has(PermissionFlagsBits.ManageMessages)) throw new GuildExceptions.NoPermissions();

    const nostal = message.client as Nostal;

    if (!count) throw new BaseExceptions.UserInputError("count");

    if (
        !message.guild.members.me?.permissions.has(PermissionFlagsBits.ManageMessages) &&
        !message.guild.members.me?.permissions.has(PermissionFlagsBits.ManageChannels)
    )
        throw new GuildExceptions.BotHasNoPermissions();

    if (count === "all") {
        await message
            .reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(nostal.branding.embedColor)
                        .setTitle("Bạn chắc chắn chứ?")
                        .setDescription("Hành động này không thể hoàn tác, tiếp tục?")
                ],
                components: [
                    new ActionRowBuilder<ButtonBuilder>().addComponents(
                        new ButtonBuilder().setCustomId("purge").setLabel("Yes").setStyle(ButtonStyle.Success),
                        new ButtonBuilder().setCustomId("purge-cancel").setLabel("No").setStyle(ButtonStyle.Danger)
                    )
                ]
            })
            .then(msg => {
                const collector = msg.createMessageComponentCollector({
                    time: 30000,
                    filter: interaction => interaction.user.id === message.author.id
                });

                collector.on("collect", async interaction => {
                    await interaction.deferUpdate();
                    if (interaction.customId === "purge") {
                        const { channel } = message;
                        if (channel instanceof GuildChannel)
                            await channel.clone().then(async clonedChannel => {
                                await channel.delete().catch(() => {
                                    throw new GuildExceptions.BotHasNoPermissions();
                                });
                                clonedChannel.setPosition(channel.position);
                            });
                    }

                    collector.stop();
                });

                collector.on("end", () => {
                    msg.edit({
                        embeds: msg.embeds,
                        components: [
                            new ActionRowBuilder<ButtonBuilder>().addComponents(
                                new ButtonBuilder().setCustomId("purge").setLabel("Yes").setStyle(ButtonStyle.Success).setDisabled(true),
                                new ButtonBuilder().setCustomId("purge-cancel").setLabel("No").setStyle(ButtonStyle.Danger).setDisabled(true)
                            )
                        ]
                    });
                });
            });
    } else if (!isNaN(parseInt(count))) message.channel.bulkDelete(parseInt(count) + 1).catch(() => {});
    else {
        throw new BaseExceptions.UserError("count phải là 1 số hoặc giá trị `all`");
    }
}

export default new NostalMessageCommand({
    name: "purge",
    description: "Xóa 1 số lượng tin nhắn",
    category: "Moderation",
    usage: [Required("count")],
    run: purgeCommand
});
