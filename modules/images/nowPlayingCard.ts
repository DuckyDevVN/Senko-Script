import { Canvas, Image, loadImage, registerFont } from "canvas";
import Colors from "constants/colors";
import { Snowflake } from "discord.js";
import { KazagumoQueue } from "kazagumo";
import { secondsToTime, thumbnail, checkLanguage } from "modules/utils";
import { getThumb } from "modules/thumbSpotify";
import youtube from "youtubei";

registerFont("./assets/fonts/NotoSansJP-Black.ttf", { family: "NotoSans" });

const play = await loadImage("./assets/images/play.png");
const pause = await loadImage("./assets/images/pause.png");
const shuffleOn = await loadImage("./assets/images/shuffle_on.png");
const shuffleOff = await loadImage("./assets/images/shuffle_off.png");
const repeatOn = await loadImage("./assets/images/repeat_on.png");
const repeatOff = await loadImage("./assets/images/repeat_off.png");
const background = await loadImage("./assets/images/now_playing_background.png");
const noThumbnail = await loadImage("./assets/images/no_thumbnail.png");

const baseCanvas = new Canvas(2400, 1200);
baseCanvas.getContext("2d").drawImage(background, 0, 0, 2400, 1200);

type VideoID = string;

interface Track {
    title: string;
    author: string;
    length: number;
    id: VideoID;
    fromYoutube: boolean;
}

interface Player {
    guildID: Snowflake;
    position: number;
    volume: number;
    voiceName: string;
    isPlaying: boolean;
    isShuffle: boolean;
    isRepeat: boolean;
    queue: KazagumoQueue;
}

const cachedCards = new Map<Snowflake, Canvas>();
const cachedThumbnails = new Map<VideoID, Image>();

export function invalidateCachedCard(guildID: string) {
    return cachedCards.delete(guildID);
}

export function invalidateAllCachedThumbnail() {
    return cachedThumbnails.clear();
}

export function invalidateCachedThumbnail(videoID: VideoID) {
    return cachedThumbnails.delete(videoID);
}

export default async function nowPlayingCard(
    video: Track = {
        title: "Aiobahn feat. KOTOKO - INTERNET YAMERO (Official Music Video) [Theme for NEEDY GIRL OVERDOSE]",
        author: "EDMS",
        length: 192000,
        id: "F6NnGEzQpPQ",
        fromYoutube: true
    },
    player: Player = {
        guildID: "1081900839981023282",
        position: 57000,
        volume: 100,
        voiceName: "Phòng Thu Âm 1",
        isPlaying: true,
        isShuffle: false,
        isRepeat: false,
        queue: new KazagumoQueue()
    }
) {
    const toBeLoaded: string[] = [];

    toBeLoaded.push(video.id);

    for (const track of player.queue.slice(0, 3)) {
        toBeLoaded.push(track.identifier);
    }

    for (const id of toBeLoaded) {
        if (!cachedThumbnails.has(id)) {
            let thumb: Image;
            try {
                if (video.fromYoutube && id.length < 20) thumb = await loadImage(thumbnail(id));
                else {
                    const thumbSpotify = await getThumb(id);
                    thumb = await loadImage(thumbSpotify.result);
                }
            } catch (error) {
                thumb = await loadImage(thumbnail(id, true));
            }
            cachedThumbnails.set(id, thumb);
        }
    }

    let canvas = cachedCards.get(player.guildID);

    // No cache! Needs to be drawn
    if (!canvas) {
        const canvas = new Canvas(2400, 1200);
        const ctx = canvas.getContext("2d");

        // Draw base canvas (background, icons, etc)
        ctx.drawImage(baseCanvas, 0, 0, 2400, 1200);

        // Draw play/pause icon (183, 779) 97x97
        ctx.drawImage(player.isPlaying ? pause : play, 183, 1085, 97, 97);
        // Draw shuffle icon (415, 803) 97x50
        ctx.drawImage(player.isShuffle ? shuffleOn : shuffleOff, 415, 1105, 97, 50);
        // Draw repeat icon (559, 803) 97x50
        ctx.drawImage(player.isRepeat ? repeatOn : repeatOff, 559, 1103, 97, 50);

        const lengthText = secondsToTime(video.length / 1000, true);
        // Draw video length text (2303, 702)
        ctx.fillStyle = Colors.White;
        ctx.font = "45px NotoSans";
        ctx.fillText(lengthText, 2303 - ctx.measureText(lengthText).width, 1000);

        // Draw thumbnail (1504, 96) 800x450
        const thumb_canvas = new Canvas(970, 540);
        const thumb_ctx = thumb_canvas.getContext("2d");
        thumb_ctx.beginPath();
        thumb_ctx.roundRect(0, 0, 970, 540, 20);
        thumb_ctx.clip();
        thumb_ctx.drawImage(cachedThumbnails.get(video.id)!, 0, 0, 970, 540);
        ctx.drawImage(thumb_canvas, 1334, 96, 970, 540);

        // Draw video title
        let titles = video.title.split(" ");
        ctx.fillStyle = Colors.White;
        ctx.font = "55px NotoSans";
        let y = 365;
        let title = "";
        for (let i = 0; i < titles.length; i++) {
            let w = titles[i];
            title += w + " ";
            if (ctx.measureText(title + titles[i + 1] ?? "").width > 1170) {
                if (title.length > 27 && (await checkLanguage(title))) {
                    ctx.fillText(title.slice(0, 26), 96, y);
                    ctx.fillText(title.slice(27), 96, y + 85);
                } else ctx.fillText(title, 96, y);
                title = "";
                y += 85;
            }
        }
        // max w: 1270
        ctx.fillText(title, 96, y);

        let x = 108;
        if (player.queue?.length > 0)
            // Draw next track
            for (const track of player.queue.slice(0, 3)) {
                // Draw thumbnail
                const thumb_canvas = new Canvas(172, 96);
                const thumb_ctx = thumb_canvas.getContext("2d");
                thumb_ctx.beginPath();
                thumb_ctx.roundRect(0, 0, 172, 96, 20);
                thumb_ctx.clip();

                thumb_ctx.drawImage(cachedThumbnails.get(track.identifier)!, 0, 0, 172, 96);

                ctx.drawImage(thumb_canvas, x, 786, 172, 96);

                // Draw title
                ctx.fillStyle = Colors.White;
                ctx.font = "25px NotoSans";
                ctx.fillText(
                        track.title.length > 30 && (await checkLanguage(track.title)) 
                        ? track.title.slice(0, 24) + "..."
                        : track.title.length > 30
                        ? track.title.slice(0, 29) + "..."
                        : track.title,
                    x + 195,
                    827
                );

                // Draw author
                ctx.fillStyle = Colors.LightGray;
                ctx.font = "23px NotoSans";
                ctx.fillText(track.author ?? "Unknown author", x + 195, 860);
                x += 752;
            }

        // Draw volume percentage (1887, 1140)
        ctx.fillStyle = Colors.DarkGray;
        ctx.font = "35px NotoSans";
        ctx.fillText(`${player.volume}%`, player.volume == 0 ? 1910 : player.volume < 100 ? 1900 : 1890, 1142);

        // Draw author name
        ctx.fillStyle = Colors.LightGray; // gray
        ctx.font = "45px NotoSans";
        ctx.fillText(video.author, 96 + 65 + 20, 265);

        // Draw author avatar
        let authorThumb = new Image();
        if (video.fromYoutube) {
            const authorInfo = await new youtube.Client().getVideo(video.id);
            if (authorInfo?.channel.thumbnails) {
                authorThumb = await loadImage(authorInfo?.channel.thumbnails[2].url);
            }
        } else {
            const thumbSpotify = await getThumb(video.id);
            authorThumb = await loadImage(thumbSpotify.artists_thumb_url);
        }
        const avatar_canvas = new Canvas(75, 75);
        const avatar_ctx = avatar_canvas.getContext("2d");

        // Circle crop avatar
        const width = avatar_canvas.width;
        const height = avatar_canvas.height;
        const radius = Math.min(width, height) / 2;

        avatar_ctx.arc(width / 2, height / 2, radius, 0, 2 * Math.PI);
        avatar_ctx.clip();

        avatar_ctx.drawImage(authorThumb, 0, 0, 75, 75);

        ctx.drawImage(avatar_canvas, 96, 215, 75, 75);

        // Draw volume bar
        let px = (201 * player.volume) / 100;
        ctx.beginPath();
        ctx.fillStyle = "#E6B325";
        ctx.roundRect(2104, 1121, px, 13, 8);
        ctx.fill();

        // Ready to cache current canvas
        cachedCards.set(player.guildID, canvas);
    }

    canvas = new Canvas(2400, 1200);
    const ctx = canvas.getContext("2d");

    // Draw cached canvas
    ctx.drawImage(cachedCards.get(player.guildID)!, 0, 0, 2400, 1200);

    // Draw Playing text (171, 138)
    ctx.font = "54px NotoSans";
    ctx.fillStyle = "#fff";

    ctx.fillText(`Đang phát tại ${player.voiceName.length > 20 ? player.voiceName.slice(0, 19) : player.voiceName}...`, 171, 138);

    // Time bar 12px
    ctx.fillStyle = "#E6B325";
    ctx.fillRect(0, 1043, (player.position / video.length) * 2400, 12);

    // Player position 99, 702
    ctx.font = "45px NotoSans";
    ctx.fillStyle = "#fff";
    ctx.fillText(secondsToTime(player.position / 1000, true), 99, 1000);

    // Return buffer png
    return canvas.toBuffer();
}
