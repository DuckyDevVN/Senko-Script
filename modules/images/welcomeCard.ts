import { createCanvas, Image, loadImage, registerFont } from "canvas";
import { GuildMember } from "discord.js";
import * as fs from "fs";

registerFont("./assets/fonts/DFVN-Mighty-Wings.ttf", {
    family: "DFVN Mighty Wings"
});
registerFont("./assets/fonts/DFVN-Fashion-Wacks.ttf", {
    family: "DFVN Fashion Wacks"
});

let background: Image | undefined;

export default async function welcomeCard(member: GuildMember) {
    const username = member.user.tag;

    const canvas = createCanvas(2048, 718);
    const context = canvas.getContext("2d");

    if (!background) background = await loadImage("assets/images/backdoor.png");

    context.drawImage(background, 0, 0);

    context.save();

    context.beginPath();
    context.arc(147 + 512 / 2, 107 + 512 / 2, 512 / 2, 0, Math.PI * 2, true);
    context.closePath();
    context.clip();

    context.drawImage(await loadImage(member.user.displayAvatarURL({ extension: "png" })), 147, 107, 512, 512);
    context.restore();

    context.font = "100px DFVN Mighty Wings";
    context.fillStyle = "white";
    context.textAlign = "center";

    context.fillText("Chào mừng", 1286, username.length <= 8 ? 200 : username.length <= 14 ? 200 : 250);
    context.fillText(`đã đến với server!`, 1276, 560);
    context.font = `${username.length <= 8 ? 180 : username.length <= 14 ? 160 : 100}px DFVN Fashion Wacks`;
    context.fillText(
        `${username.length <= 8 ? username : username.length >= 20 ? username.slice(1, Math.floor(username.length / 2)).trim() + "..." : username}`,
        1276,
        410
    );

    // fs.writeFileSync("./canvas.png", canvas.toBuffer());

    return canvas.toBuffer();
}

// welcomeCard()
