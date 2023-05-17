import { inlineCode, Message } from "discord.js";
import { KazagumoTrack } from "kazagumo";
import { NostalMessageCommand } from "modules/command";
import { MusicExceptions } from "modules/exceptions";
import { invalidateCachedCard, invalidateCachedThumbnail } from "modules/images/nowPlayingCard";
import Nostal from "Nostal";

async function skipCommand(message: Message<true>) {
    if (!message.guild) return;
    if (!message.member?.voice.channel) throw new MusicExceptions.UserNotInVoiceChannel();

    const nostal = message.client as Nostal;
    const player = nostal.kazagumo.players.get(message.guild.id);

    if (!player) throw new MusicExceptions.BotNotPlaying();
    if (player.voiceId !== message.member.voice.channel.id) throw new MusicExceptions.BotInAnotherVoiceChannel();

    if (!player.queue.current) throw new MusicExceptions.NothingIsPlaying();

    player.data.set("skipped", true);
    player.skip();
    await message.reply(`Đã skip ${inlineCode(player.queue.current.title)}`);

    invalidateCachedCard(message.guild.id);
    invalidateCachedThumbnail((player.data.get("track") as KazagumoTrack).identifier);
}

export default new NostalMessageCommand({
    name: "skip",
    aliases: ["s", "next", "n"],
    category: "music",
    description: "Bài gì dở vậy bỏ qua điiiii >.<",
    run: skipCommand
});
