import { Client, Events } from "discord.js";
import NostalEvent from "../modules/event";
import wishLoader from "handlers/wishLoader.js";
import { test } from "../test";
import Nostal from "Nostal";

async function onReady(nostal: Client) {
    console.log(`Logged in as ${nostal.user?.tag}!`);
    await wishLoader(nostal as Nostal);
}

export default new NostalEvent({
    eventName: Events.ClientReady,
    run: onReady
});
