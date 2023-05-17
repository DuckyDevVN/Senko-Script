import Nostal from "Nostal";
import { Message } from "discord.js";
import { NostalMessageCommand } from "modules/command";
import { MusicExceptions } from "modules/exceptions";
import { invalidateAllCachedThumbnail, invalidateCachedCard } from "modules/images/nowPlayingCard";

async function clearQueueCommand(message: Message<true>) {
    if (!message.member?.voice.channel) throw new MusicExceptions.UserNotInVoiceChannel();

    const nostal = message.client as Nostal;
    const player = nostal.kazagumo.players.get(message.guild.id);

    if (!player) throw new MusicExceptions.BotNotPlaying();
    if (player.voiceId !== message.member.voice.channel.id) throw new MusicExceptions.BotInAnotherVoiceChannel();

    if (player.queue.length === 0) throw new MusicExceptions.EmptyQueue();
    player.queue.splice(0, player.queue.length);
    await message.reply("Xóa queue rồi đi ngủ đi");

    invalidateCachedCard(message.guild.id);
    invalidateAllCachedThumbnail();
}

export default new NostalMessageCommand({
    name: "clearqueue",
    aliases: ["clear_queue", "cq", "clearq", "cqueue", "c_queue"],
    category: "music",
    description: "Clear queue rồi đi ngủ đi",
    run: clearQueueCommand
});
