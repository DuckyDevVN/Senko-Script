import Nostal from "Nostal";
import { Message } from "discord.js";
import { NostalMessageCommand } from "modules/command";
import { BaseExceptions, MusicExceptions } from "modules/exceptions";
import { invalidateCachedCard } from "modules/images/nowPlayingCard";
import { Optional } from "modules/usageArgumentTypes";

async function volumeCommand(message: Message<true>, volume?: string) {
    if (!message.member?.voice.channel) throw new MusicExceptions.UserNotInVoiceChannel();

    const nostal = message.client as Nostal;
    const player = nostal.kazagumo.players.get(message.guild.id);

    if (!player) throw new MusicExceptions.BotNotPlaying();
    if (player.voiceId !== message.member.voice.channel.id) throw new MusicExceptions.BotInAnotherVoiceChannel();

    if (!message.content.split(" ")[1]) {
        return await message.reply(`Âm lượng hiện tại là: ${player.volume * 100}%`);
    }

    if (!volume) throw new BaseExceptions.UserInputError("volume");

    if (isNaN(Number(volume))) throw new MusicExceptions.NoValueVolume();

    player.setVolume(Number(volume));
    await message.reply(`Đã chình âm lượng thành ${volume}%`);

    invalidateCachedCard(message.guild.id);
}

export default new NostalMessageCommand({
    name: "volume",
    aliases: ["vol"],
    category: "music",
    description: "Có vẻ như âm lượng chưa phù hợp :3",
    usage: [Optional("volume")],
    run: volumeCommand
});
