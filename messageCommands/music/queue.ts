import { Message } from "discord.js";
import { NostalMessageCommand } from "modules/command";
import { MusicExceptions } from "modules/exceptions";
import { secondsToTime } from "modules/utils";
import Nostal from "Nostal";

async function queueCommand(message: Message<true>) {
    if (!message.member?.voice.channel) throw new MusicExceptions.UserNotInVoiceChannel();

    const nostal = message.client as Nostal;
    const player = nostal.kazagumo.players.get(message.guild.id);

    if (!player) throw new MusicExceptions.BotNotPlaying();
    if (player.voiceId !== message.member.voice.channel.id) throw new MusicExceptions.BotInAnotherVoiceChannel();

    const queue = player.queue;

    if (queue.length === 0) throw new MusicExceptions.EmptyQueue();

    await message.reply({
        embeds: [
            {
                author: {
                    name: message.author.tag,
                    icon_url: message.author.displayAvatarURL()
                },
                title: "Queue",
                description: queue
                    .map((song, index) => {
                        if (index === 10) return "...";
                        else if (index > 10) return;
                        return (
                            `${index + 1}. [${song.title}](${song.uri}) ` + `(${song.length ? secondsToTime(song.length / 1000) : "Unknown length"})`
                        );
                    })
                    .join("\n"),
                color: nostal.branding.embedColor,
                thumbnail: {
                    url: `https://i.ytimg.com/vi/${queue[0].identifier}/maxresdefault.jpg`
                },
                footer: {
                    text: `Total: ${queue.length} ${queue.length === 1 ? "song" : "songs"}`
                },
                timestamp: new Date().toISOString()
            }
        ]
    });
}

export default new NostalMessageCommand({
    name: "queue",
    aliases: ["q"],
    category: "music",
    description: "Nhạc gì đang chờ thế?",
    run: queueCommand
});
