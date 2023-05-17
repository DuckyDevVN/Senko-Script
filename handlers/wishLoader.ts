import cron from "node-cron";
import { readFileSync } from "fs";
import { v4 as uuidv4 } from "uuid";
uuidv4()

import Nostal from "../Nostal";
import { AttachmentBuilder, Channel, TextChannel } from "discord.js";


export default async function wishLoader(nostal: Nostal) {
    cron.schedule('0 0 21 * * *', () => {
		nostal.guilds.cache.forEach(async (guild, index) => {
            const data = await nostal.db.get(`${guild.id}.channel.wish`) as string
            if (!data) return;
            const channel = nostal.channels.cache.get(data) as TextChannel;
            await channel.send({
                content: "Tối rồi chúc mọi người ngủ ngon ❤️❤️❤️",
                files: [
                    new AttachmentBuilder(readFileSync("./assets/images/GN.jpeg"))
                ]
            })
        });
	}, {
		scheduled: true,
		timezone: "Asia/Ho_Chi_Minh"
	});
    cron.schedule('0 0 6 * * *', () => {
		nostal.guilds.cache.forEach(async (guild, index) => {
            const data = await nostal.db.get(`${guild.id}.channel.wish`) as string
            if (!data) return;
            const channel = nostal.channels.cache.get(data) as TextChannel;
            await channel.send({
                content: "Chúc mọi người buổi sáng vui vẻ ❤️❤️❤️",
                files: [
                    new AttachmentBuilder(readFileSync("./assets/images/GM.jpeg"))
                ]
            })
        });
	}, {
		scheduled: true,
		timezone: "Asia/Ho_Chi_Minh"
	});
    cron.schedule('0 0 12 * * *', () => {
		nostal.guilds.cache.forEach(async (guild, index) => {
            const data = await nostal.db.get(`${guild.id}.channel.wish`) as string
            if (!data) return;
            const channel = nostal.channels.cache.get(data) as TextChannel;
            await channel.send({
                content: "Chúc mọi người buổi trưa vui vẻ ❤️❤️❤️",
                files: [
                    new AttachmentBuilder(readFileSync("./assets/images/GAM.jpeg"))
                ]
            })
        });
	}, {
		scheduled: true,
		timezone: "Asia/Ho_Chi_Minh"
	});
}
