import { ClientEvents } from "discord.js";

interface NostalEventOptions<Event extends keyof ClientEvents> {
    eventName: Event;
    once?: boolean;
    run: (...args: ClientEvents[Event]) => Promise<void>;
}

export default class NostalEvent<Event extends keyof ClientEvents> {
    constructor(options: NostalEventOptions<Event>) {
        this.eventName = options.eventName;
        this.once = options.once;
        this.run = options.run;
    }

    eventName;
    once?;
    run;
}
