import { Events, Message } from "discord.js";
import { runMessageCommand } from "../handlers/commandHandler.js";
import wishHandlers from "handlers/wishHandlers.js";
import NostalEvent from "../modules/event";
import { afkLoader } from "handlers/afkLoader.js";

async function onMessageCreate(message: Message) {
    if (message.author.bot) return;

    await runMessageCommand(message);
    await wishHandlers(message);
    await afkLoader(message);
}

export default new NostalEvent({
    eventName: Events.MessageCreate,
    run: onMessageCreate
});
