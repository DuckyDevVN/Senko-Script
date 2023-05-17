import Nostal from "Nostal";
import { AutocompleteInteraction, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { NostalSlashCommand } from "modules/command";
import { BaseExceptions, MusicExceptions } from "modules/exceptions";

async function soundcloudCommand(interaction: ChatInputCommandInteraction) {
    if (!interaction.inGuild()) return;

    const voiceChannel = interaction.guild?.members.cache.get(interaction.user.id)?.voice.channel;
    if (!voiceChannel) throw new MusicExceptions.UserNotInVoiceChannel();

    const nostal = interaction.client as Nostal;
    let player = nostal.kazagumo.players.get(interaction.guild.id);

    if (player && player.voiceId !== voiceChannel.id) throw new MusicExceptions.BotInAnotherVoiceChannel();

    const request = interaction.options.getString("request");

    if (!request) throw new BaseExceptions.UserError("Bạn phải nhập tên bài hát hoặc link soundcloud nhé!");

    player = await nostal.kazagumo.createPlayer({
        guildId: interaction.guild.id,
        textId: interaction.channel?.id!,
        voiceId: voiceChannel.id
    });

    const result = await player.search(request, {
        requester: interaction.user,
        engine: "soundcloud"
    });

    if (!result.tracks.length) throw new MusicExceptions.NoResult();

    if (result.type === "PLAYLIST") for (const track of result.tracks) player.queue.add(track);
    else player.queue.add(result.tracks[0]);

    player.data.set(result.tracks[0].title, interaction.member);
    if (!player.playing) await player.play();

    await interaction.reply(
        result.type === "PLAYLIST"
            ? `Đã thêm ${result.tracks.length} bài từ playlist \`${result.playlistName}\` vào hàng đợi`
            : `Đã thêm vào hàng đợi: \`${result.tracks[0].title}\``
    );
}

async function soundcloudCommandAutocomplete(interaction: AutocompleteInteraction) {
    if (!interaction.options.getFocused()) return;
    await interaction.respond(
        // Respond to the autocomplete
        (
            await (interaction.client as Nostal).kazagumo.search(
                // Search it
                interaction.options.getFocused(), // What user is typing
                { requester: interaction.user, engine: "soundcloud" }
            )
        ).tracks
            .slice(0, 10)
            .map(track => ({
                name: track.title.length > 100 ? track.title.slice(0, 96) + "..." : track.title,
                value: track.title.length > 100 ? track.title.slice(0, 96) + "..." : track.title
            }))
    );
}

export default new NostalSlashCommand({
    // @ts-ignore lmeo ồn ào nhếu nháo nó chạy đc kìa typescript succ
    data: new SlashCommandBuilder()
        .setName("soundcloud")
        .setDescription("Sound from the cloud")
        .addStringOption(option =>
            option.setName("request").setDescription("Tên bài hát hoặc link soundcloud").setRequired(true).setAutocomplete(true)
        ),
    run: soundcloudCommand,
    completion: soundcloudCommandAutocomplete
});
