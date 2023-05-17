import { Message } from "discord.js";
import { NostalMessageCommand } from "modules/command.js";

async function pingCommand(message: Message) {
    await message.reply(`Pong! ${message.client.ws.ping}ms`);
}

export default new NostalMessageCommand({
    name: "ping",
    aliases: ["pong"],
    category: "misc",
    description: "Pings the bot",
    run: pingCommand
});
