import {
    Message,
    AttachmentBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    setPosition,
    StringSelectMenuOptionBuilder,
    StringSelectMenuComponent
} from "discord.js";
import { NostalMessageCommand } from "modules/command";
import { MusicExceptions, BaseExceptions } from "modules/exceptions";
import { searchCard } from "modules/images/searchCard";
import Nostal from "Nostal";

async function searchCommand(message: Message<true>, ...request: string[]) {
    if (!message.member?.voice.channel) throw new MusicExceptions.UserNotInVoiceChannel();

    const nostal = message.client as Nostal;
    let player = nostal.kazagumo.players.get(message.guild.id);

    if (!player)
        player = await nostal.kazagumo.createPlayer({
            guildId: message.guild.id,
            textId: message.channel.id,
            voiceId: message.member.voice.channel.id
        });
    if (player.voiceId !== message.member.voice.channel.id) throw new MusicExceptions.BotInAnotherVoiceChannel();

    if (request.length === 0) throw new BaseExceptions.UserError("Bạn phải nhập tên bài hát hoặc link youtube nhé!");

    const result = await player.search(request.join(" ").trim(), {
        requester: message
    });

    if (!result.tracks.length) throw new MusicExceptions.NoResult();

    if (request.join(" ").trim().startsWith("https://")) {
        player.queue.add(result.tracks[0]);
        if (!player.playing) await player.play();
    } else {
        let start: number = 0,
            end: number = 5;

        let row = new StringSelectMenuBuilder();

        async function trackSearch(startIndex: number, endIndex: number) {
            const trackSearchResult: {
                author: string;
                identifier: string;
                title: string;
            }[] = [];
            let cout = startIndex;
            row = new StringSelectMenuBuilder().setCustomId("search").setPlaceholder("Nhấn vào đây để chọn!!");
            for (let track of result.tracks.slice(startIndex, endIndex)) {
                trackSearchResult.push({
                    author: track.author ?? "",
                    identifier: track.identifier ?? "",
                    title: track.title ?? ""
                });
                row.addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel(track.title)
                        .setDescription(track.author ?? "")
                        .setValue(`${cout}`)
                );
                cout++;
            }
            row.addOptions(new StringSelectMenuOptionBuilder().setLabel("Tiếp theo").setDescription("Hiện những bài hát khác").setValue("next"));
            return trackSearchResult;
        }

        const msg = await message.reply({
            files: [
                new AttachmentBuilder(
                    await searchCard(message.member.displayAvatarURL() ?? "", request.join(" ").trim(), await trackSearch(start, end))
                )
            ],
            components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(row)]
        });
        const collector = msg.createMessageComponentCollector({
            filter: interaction => interaction.user.id === message.author.id,
            idle: 60_000
        });

        collector.on("collect", async interaction => {
            if (interaction.isStringSelectMenu()) {
                if (interaction.values[0] == "next") {
                    start += 6;
                    end += 6;
                    interaction.deferReply({ ephemeral : true });
                    msg.edit({
                        files: [
                            new AttachmentBuilder(
                                await searchCard(interaction.member.displayAvatarURL() ?? "", request.join(" ").trim(), await trackSearch(start, end))
                            )
                        ],
                        components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(row)]
                    });
                    interaction.editReply({
                        embeds: [
                            {
                                description: `Đã chọn xuất hiện những bài hát tiếp theo`,
                                color: nostal.branding.embedColor
                            }
                        ],
                    });
                } else {
                    const option = Number(interaction.values[0]);
                    player?.queue.add(result.tracks[option]);
                    if (!player?.playing) await player?.play();
                    interaction.reply({
                        embeds: [
                            {
                                description: `Đã chọn ${result.tracks[option].title}`,
                                color: nostal.branding.embedColor
                            }
                        ],
                        ephemeral: true
                    });
                    msg.edit({
                        components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(row.setDisabled(true))]
                    });
                }
            }
        });

        collector.on("end", (collected, reason) => {
            if (reason == "delete") msg.delete()
            else msg.edit({
                components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(row.setDisabled(true))]
            });
        });
    }
}

export default new NostalMessageCommand({
    name: "search",
    category: "music",
    description: "Hãy tìm kiến bài hát của bạn",
    run: searchCommand
});
