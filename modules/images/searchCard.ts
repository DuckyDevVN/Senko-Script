import { Canvas, Image, loadImage, registerFont } from "canvas";
import Colors from "constants/colors";
import { Snowflake } from "discord.js";
import { KazagumoQueue, KazagumoSearchResult, KazagumoTrack } from "kazagumo";
import { secondsToTime, thumbnail, checkLanguage } from "modules/utils";
import { getThumb } from "modules/thumbSpotify";
import youtube from "youtubei";

registerFont("./assets/fonts/NotoSansJP-Black.ttf", { family: "NotoSans" });

const background = await loadImage("./assets/images/background_search.png");

const baseCanvas = new Canvas(1200, 552);
baseCanvas.getContext("2d").drawImage(background, 0, 0, 1200, 552);

export async function searchCard(
    avatarMember: string = "https://cdn.discordapp.com/avatars/970533783528931348/47a02fbb1cfa084910164628cda8e50a.png",
    prompt: string,
    trackSearchResult: {
        author: string;
        identifier: string;
        title: string;
    }[] = [
        {
            author: "Cryz T",
            identifier: "fk7yEAs3sfQ",
            title: "Nhạc Lofi 2023 - Những Bản Nhạc Lofi..."
        },
        {
            author: "Hạ Sang",
            identifier: "WTfeIj1-fNQ",
            title: "Nhạc Lofi 2023 - Những Bản Lofi Mix..."
        },
        {
            author: "Lofi Girl",
            identifier: "jfKfPfyJRdk",
            title: "lofi hip hop radio 📚 - beats to..."
        },
        {
            author: "Will M",
            identifier: "TPu3faFNb34",
            title: "Gió Mang Hương Về Giờ Em Ở Đâu..."
        },
        {
            author: "Reply 1988",
            identifier: "sfAmauhFSLQ",
            title: "Dù Hai Ta Già Đi Và Dù Hai Ta Già..."
        }
    ]
) {
    const cachedThumbnails = [];

    for (let track of trackSearchResult) {
        let thumb: Image;
        try {
            thumb = await loadImage(thumbnail(track.identifier));
        } catch (err) {
            thumb = await loadImage(thumbnail(track.identifier, true));
        }
        cachedThumbnails.push(thumb);
    }

    const canvas = new Canvas(1200, 552);
    const ctx = canvas.getContext("2d");

    // Draw base canvas (background, icons, etc)
    ctx.drawImage(baseCanvas, 0, 0, 1200, 552);

    let yTitle = 442,
        xTitle = 66,
        yAuth = 490,
        xAuth = 114,
        yThumb = 124,
        xThumb = 66;
    for (let i = 0; trackSearchResult.length > i; i++) {
        if (i < 1) {
            ctx.fillStyle = Colors.White;
            ctx.font = "24px NotoSans";
            ctx.fillText(
                trackSearchResult[i].title.length > 39 ? trackSearchResult[i].title.slice(0, 38) + "..." : trackSearchResult[i].title,
                xTitle,
                yTitle
            );
            yTitle -= 315;
            xTitle += 685;

            ctx.fillStyle = Colors.LightGray;
            ctx.font = "20px NotoSans";
            ctx.fillText(trackSearchResult[i].author, xAuth, yAuth);
            yAuth -= 335;
            xAuth += 637;

            const thumb_canvas = new Canvas(480, 270);
            const thumb_ctx = thumb_canvas.getContext("2d");
            thumb_ctx.beginPath();
            thumb_ctx.roundRect(0, 0, 480, 270, 12);
            thumb_ctx.clip();
            thumb_ctx.drawImage(cachedThumbnails[i], 0, 0, 480, 270);
            ctx.drawImage(thumb_canvas, xThumb, yThumb, 480, 270);
            yThumb -= 28;
            xThumb += 546;

            const authorInfo = await new youtube.Client().getVideo(trackSearchResult[i].identifier);
            if (authorInfo?.channel.thumbnails) {
                const authorThumb = await loadImage(authorInfo?.channel.thumbnails[2].url);
                const avatar_canvas = new Canvas(36, 36);
                const avatar_ctx = avatar_canvas.getContext("2d");

                // Circle crop avatar
                const width = avatar_canvas.width;
                const height = avatar_canvas.height;
                const radius = Math.min(width, height) / 2;

                avatar_ctx.arc(width / 2, height / 2, radius, 0, 2 * Math.PI);
                avatar_ctx.clip();

                avatar_ctx.drawImage(authorThumb, 0, 0, 36, 36);

                ctx.drawImage(avatar_canvas, 66, 466, 36, 36);
            }
        } else {
            ctx.fillStyle = Colors.White;
            ctx.font = "22px NotoSans";
            ctx.fillText(
                trackSearchResult[i].title.length > 30 ? trackSearchResult[i].title.slice(0, 30) + "..." : trackSearchResult[i].title,
                xTitle,
                yTitle
            );
            yTitle += 90;

            ctx.fillStyle = Colors.LightGray;
            ctx.font = "20px NotoSans";
            ctx.fillText(trackSearchResult[i].author, xAuth, yAuth);
            yAuth += 90;

            const thumb_canvas = new Canvas(128, 72);
            const thumb_ctx = thumb_canvas.getContext("2d");
            thumb_ctx.beginPath();
            thumb_ctx.roundRect(0, 0, 128, 72, 6);
            thumb_ctx.clip();
            thumb_ctx.drawImage(cachedThumbnails[i], 0, 0, 128, 72);
            ctx.drawImage(thumb_canvas, xThumb, yThumb, 128, 72);
            yThumb += 90;
        }
    }

    return canvas.toBuffer();
}
