import Nostal from "Nostal";
import { Message } from "discord.js";
import { NostalMessageCommand } from "modules/command";
import { MusicExceptions } from "modules/exceptions";
import nowPlayingCard from "modules/images/nowPlayingCard";

async function nowPlayingCommand(message: Message<true>) {
    if (!message.member?.voice.channel) throw new MusicExceptions.UserNotInVoiceChannel();

    const nostal = message.client as Nostal;
    const player = nostal.kazagumo.players.get(message.guild.id);

    if (!player) throw new MusicExceptions.BotNotPlaying();
    if (player.voiceId !== message.member.voice.channel.id) throw new MusicExceptions.BotInAnotherVoiceChannel();

    const currentTrack = player.queue.current;
    if (!currentTrack) throw new MusicExceptions.NothingIsPlaying();

    // cái position của kazagumo nó khá là dỏm :>
    const startPosition = player.data.get("startPosition") as number;
    await message.reply({
        files: [
            {
                attachment: await nowPlayingCard(
                    {
                        author: currentTrack.author ?? "Unknown author",
                        length: currentTrack.length ?? 0,
                        title: currentTrack.title,
                        id: currentTrack.identifier,
                        fromYoutube: currentTrack.sourceName === "youtube"
                    },
                    {
                        position: new Date().getTime() - startPosition,
                        guildID: message.guild.id,
                        volume: player.volume * 100,
                        voiceName: message.member.voice.channel.name,
                        isPlaying: player.playing,
                        isRepeat: false,
                        isShuffle: false,
                        queue: player.queue
                    }
                )
            }
        ]
    });
}

export default new NostalMessageCommand({
    name: "nowplaying",
    aliases: ["np", "current", "now", "playing", "currentsong", "now_playing"],
    category: "music",
    description: "Đang phát bài gì dzậy?",
    run: nowPlayingCommand
});
