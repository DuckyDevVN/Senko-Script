import { lstatSync, readdirSync } from "fs";

import { NostalMessageCommand, NostalSlashCommand } from "../modules/command";
import Nostal from "../Nostal";

const MESSAGE_COMMAND_DIR = "./messageCommands/";
const SLASH_COMMAND_DIR = "./slashCommands/";

export default async function loadCommands(nostal: Nostal) {
    readdirSync(MESSAGE_COMMAND_DIR).forEach(async item => {
        async function loadCommand(root: string, item: string) {
            if (lstatSync(root + item).isDirectory()) {
                const newRoot = root + item + "/";
                readdirSync(newRoot).forEach(async item => {
                    loadCommand(newRoot, item);
                });
            } else {
                const messageCommand = (await import(`.${root}${item}`)).default as NostalMessageCommand;

                nostal.messageCommands.set(messageCommand.name, messageCommand);
                messageCommand.aliases?.forEach(alias => nostal.messageCommands.set(alias, messageCommand));
            }
        }
        await loadCommand(MESSAGE_COMMAND_DIR, item);
    });

    readdirSync(SLASH_COMMAND_DIR).forEach(async item => {
        async function loadCommand(root: string, item: string) {
            if (lstatSync(root + item).isDirectory()) {
                const newRoot = root + item + "/";
                readdirSync(newRoot).forEach(async item => {
                    loadCommand(newRoot, item);
                });
            } else {
                const slashCommand = (await import(`.${root}${item}`)).default as NostalSlashCommand;

                nostal.slashCommands.set(slashCommand.data.name, slashCommand);
            }
        }
        await loadCommand(SLASH_COMMAND_DIR, item);
    });
}
