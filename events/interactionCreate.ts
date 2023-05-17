import { Events, Interaction } from "discord.js";
import { runInteraction } from "../handlers/commandHandler";
import NostalEvent from "../modules/event";

async function onInteractionCreate(interaction: Interaction) {
    await runInteraction(interaction);
}

export default new NostalEvent({
    eventName: Events.InteractionCreate,
    run: onInteractionCreate
});
