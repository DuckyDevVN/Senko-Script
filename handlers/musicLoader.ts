import { Kazagumo, KazagumoTrack } from "kazagumo";
import Spotify from "kazagumo-spotify";
import { Connectors, NodeOption } from "shoukaku";

import { TextChannel, inlineCode, GuildMember, Message, VoiceChannel } from "discord.js";
import { invalidateAllCachedThumbnail, invalidateCachedCard, invalidateCachedThumbnail } from "modules/images/nowPlayingCard";
import Nostal from "../Nostal";
import nowPlayingCard from "modules/images/nowPlayingCard";

interface SpotifyConfig {
    clientId: string;
    clientSecret: string;
}

export default function loadKazagumo(nostal: Nostal, nodes: NodeOption[], spotifyConfig: SpotifyConfig) {
    const kazagumo: Kazagumo = new Kazagumo(
        {
            defaultSearchEngine: "youtube",
            plugins: [
                new Spotify({
                    clientId: spotifyConfig.clientId,
                    clientSecret: spotifyConfig.clientSecret
                })
            ],
            send: (guildId, payload) => {
                const guild = nostal.guilds.cache.get(guildId);
                if (guild) guild.shard.send(payload);
            }
        },
        new Connectors.DiscordJS(nostal),
        nodes
    );

    kazagumo.shoukaku.on("ready", (name, reconnected) => console.log(`Lavalink node ${name} ${reconnected ? "reconnected" : "is now connected"}`));

    kazagumo.shoukaku.on("error", (name, error) => console.error(`Lavalink node ${name} emitted an error.`, error));

    kazagumo.shoukaku.on("close", (name, code, reason) =>
        console.error(`Lavalink node ${name} closed with code ${code}. Reason: ${reason || "No reason"}`)
    );

    kazagumo.shoukaku.on("reconnecting", name => console.warn(`Lavalink node ${name} is reconnecting.`));

    kazagumo.shoukaku.on("disconnect", (name, players, moved) => {
        if (moved) return;
        players.map(player => player.connection.disconnect());
        console.warn(`Lavalink node ${name}: Disconnected`);
    });

    kazagumo.on("playerStart", async (player, track) => {
        const message = track.requester as Message;
        const msg = await (nostal.channels.cache.get(player.textId) as TextChannel).send({
            files: [
            {
                attachment: await nowPlayingCard(
                    {
                        author: track.author ?? "Unknown author",
                        length: track.length ?? 0,
                        title: track.title,
                        id: track.identifier,
                        fromYoutube: track.sourceName === "youtube"
                    },
                    {
                        position: track.position ?? 0,
                        guildID: message.member?.guild.id ?? "Unknown id",
                        volume: player.volume * 100,
                        voiceName: message.member?.voice.channel?.name ?? "Unknown channel",
                        isPlaying: player.playing,
                        isRepeat: false,
                        isShuffle: false,
                        queue: player.queue
                    }
                )
            }
        ]
    });

        invalidateCachedCard(player.guildId);

        player.data.set("track", track);
        player.data.set("startPosition", new Date().getTime());
        player.data.set("message", msg);
    });

    kazagumo.on("playerEnd", player => {
        const track = player.data.get("track") as KazagumoTrack;

        invalidateCachedCard(player.guildId);
        (player.data.get("message") as Message).delete();
        player.data.delete("message");
        if (!player.queue.indexOf(track)) invalidateCachedThumbnail(track.identifier);

        if (player.data.get("skipped")) return player.data.delete("skipped");
        (nostal.channels.cache.get(player.textId) as TextChannel).send(`Hết bài ${inlineCode(track.title)} rồi nè :>`);
        
    });

    kazagumo.on("playerMoved", (player, state, channels) => {
        if (state !== "MOVED") return;
        player.voiceId = channels.newChannelId!;
    });

    kazagumo.on("playerEmpty",async player => {
        const track = player.data.get("track") as KazagumoTrack;

        (player.data.get("message") as Message).delete();
        player.data.delete("message");
        (nostal.channels.cache.get(player.textId) as TextChannel).send(`Hết bài ${inlineCode(track.title)} rồi nè :>`);
        invalidateCachedCard(player.guildId);
        invalidateAllCachedThumbnail();
        if ((await nostal.channels.cache.get(player.voiceId ?? "") as VoiceChannel).members.map.length < 1 || !player.voiceId) {
            player.destroy();
            (nostal.channels.cache.get(player.textId) as TextChannel).send("Hết nhạc tui sủi đây.");
        }
    });

    kazagumo.on("playerStuck", (player, error) => {
        (nostal.channels.cache.get(player.textId) as TextChannel).send(`Kẹt bài ${inlineCode(player.data.get("track")?.title)} gòi :<`);
        player.data.set("skipped", true);
        player.skip();
        console.error(error);
    });

    return kazagumo;
}
