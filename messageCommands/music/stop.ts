import { Message } from "discord.js";
import { NostalMessageCommand } from "modules/command";
import { MusicExceptions } from "modules/exceptions";
import { invalidateAllCachedThumbnail, invalidateCachedCard } from "modules/images/nowPlayingCard";
import Nostal from "Nostal";

async function stopCommand(message: Message<true>) {
    if (!message.member?.voice.channel) throw new MusicExceptions.UserNotInVoiceChannel();

    const nostal = message.client as Nostal;
    const player = nostal.kazagumo.players.get(message.guild.id);

    if (!player) throw new MusicExceptions.BotNotPlaying();
    if (player.voiceId !== message.member.voice.channel.id) throw new MusicExceptions.BotInAnotherVoiceChannel();

    await player.destroy();
    await message.reply("bái bai");

    invalidateCachedCard(message.guild.id);
    invalidateAllCachedThumbnail();
}

export default new NostalMessageCommand({
    name: "stop",
    category: "music",
    description: "Dừng nhạc coi >:)",
    run: stopCommand
});
