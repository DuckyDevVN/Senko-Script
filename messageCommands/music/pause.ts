import { Message } from "discord.js";
import { NostalMessageCommand } from "modules/command";
import { MusicExceptions } from "modules/exceptions";
import { invalidateCachedCard } from "modules/images/nowPlayingCard";
import Nostal from "Nostal";

async function pauseCommand(message: Message<true>) {
    if (!message.member?.voice.channel) throw new MusicExceptions.UserNotInVoiceChannel();

    const nostal = message.client as Nostal;
    const player = nostal.kazagumo.players.get(message.guild.id);

    if (!player) throw new MusicExceptions.BotNotPlaying();
    if (player.voiceId !== message.member.voice.channel.id) throw new MusicExceptions.BotInAnotherVoiceChannel();
    if (player.paused) throw new MusicExceptions.AlreadyPaused();

    await player.pause(true);
    await message.reply("Tạm dừng nhạc rồi nèèè :3");

    invalidateCachedCard(message.guild.id);
}

export default new NostalMessageCommand({
    name: "pause",
    category: "music",
    description: "Tạm đừng nhạc xíu đêêêê",
    run: pauseCommand
});
