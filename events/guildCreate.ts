import { Events, Guild } from "discord.js";
import NostalEvent from "../modules/event";
import Nostal from "../Nostal";

async function onGuildCreate(guild: Guild) {
    console.log(`Joined guild ${guild.name}!`);
    const nostal = guild.client as Nostal;

    await nostal.db.set(`${guild.id}`, {});
}

export default new NostalEvent({
    eventName: Events.GuildCreate,
    run: onGuildCreate
});
