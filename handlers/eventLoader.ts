import { readdirSync } from "fs";

import NostalEvent from "../modules/event";
import Nostal from "../Nostal";

const EVENT_DIR = "./events/";

export default async function loadEvents(nostal: Nostal) {
    readdirSync(EVENT_DIR).forEach(async file => {
        const clientEvent = (await import(`.${EVENT_DIR}${file}`)).default as NostalEvent<any>;
        nostal.on(clientEvent.eventName, clientEvent.run);
    });
}
