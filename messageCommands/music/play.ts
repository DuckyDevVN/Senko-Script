import Nostal from "Nostal";
import { Message } from "discord.js";
import { NostalMessageCommand } from "modules/command";
import { BaseExceptions, MusicExceptions } from "modules/exceptions";
import { invalidateCachedCard } from "modules/images/nowPlayingCard";
import { Optional } from "modules/usageArgumentTypes";

async function playCommand(message: Message<true>, ...request: string[]) {
    if (!message.member?.voice.channel) throw new MusicExceptions.UserNotInVoiceChannel();

    const nostal = message.client as Nostal;
    let player = nostal.kazagumo.players.get(message.guild.id);

    if (player) {
        if (player.voiceId !== message.member.voice.channel.id) throw new MusicExceptions.BotInAnotherVoiceChannel();

        if (player.paused) {
            await player.pause(false);
            return await message.reply("Tiếp tục nhạc nè!");
        }
    }

    if (request.length === 0) throw new BaseExceptions.UserError("Bạn phải nhập tên bài hát hoặc link youtube nhé!");

    player = await nostal.kazagumo.createPlayer({
        guildId: message.guild.id,
        textId: message.channel.id,
        voiceId: message.member.voice.channel.id
    });

    const result = await player.search(request.join(" ").trim(), {
        requester: message
    });

    if (!result.tracks.length) throw new MusicExceptions.NoResult();

    if (result.type === "PLAYLIST") for (const track of result.tracks) player.queue.add(track);
    else player.queue.add(result.tracks[0]);

    if (!player.playing) await player.play();

    await message.reply(
        result.type === "PLAYLIST"
            ? `Đã thêm ${result.tracks.length} bài từ playlist \`${result.playlistName}\` vào hàng đợi`
            : `Đã thêm vào hàng đợi: \`${result.tracks[0].title}\``
    );

    invalidateCachedCard(message.guild.id);
}

export default new NostalMessageCommand({
    name: "play",
    aliases: ["p"],
    category: "music",
    description: "Nghe nhạc gì đây nghe nhạc gì đây",
    usage: [Optional("youtube_link")],
    run: playCommand
});
