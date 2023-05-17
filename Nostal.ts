import { readFileSync } from "fs";

import { Client, ClientOptions, GatewayIntentBits, Snowflake } from "discord.js";

import { Kazagumo } from "kazagumo";
import { QuickDB } from "quick.db";

import config from "config";

import loadCommands from "handlers/commandLoader";
import database from "handlers/databaseLoader";
import loadEvents from "handlers/eventLoader";
import loadKazagumo from "handlers/musicLoader";

import { NostalMessageCommand, NostalSlashCommand } from "modules/command";

const package_json = JSON.parse(readFileSync("./package.json", "utf-8"));

interface NostalBrandingOptions {
    embedColor: number;
    emojis: {
        error: string;
        loading: string;
        coin: string;
        bank: string;
        wallet: string;
    };
}

interface NostalOptions extends ClientOptions {
    version: string;
    prefix?: string;

    owners?: string[];
    managers?: string[];

    branding?: NostalBrandingOptions;
}

export default class Nostal extends Client {
    constructor(options: NostalOptions) {
        super(options);

        this.version = options.version;
        this.defaultPrefix = options.prefix || "nh!";
        this.prefixes = new Map<Snowflake, string>();

        this.owners = options.owners || [];
        this.managers = options.managers || [];

        this.messageCommands = new Map();
        this.slashCommands = new Map();

        this.db = database;
        this.kazagumo = loadKazagumo(this, config.lavalink_nodes, config.spotify);

        this.branding = options.branding || {
            embedColor: 0x1a1824,
            emojis: {
                error: "<a:alert:1081902415701356605>",
                loading: "<a:loading:1027196377245155348>",
                coin: "<:senkocoin:1106546209256120380>",
                bank: ":bank:",
                wallet: ":purse:"
            }
        };

        loadEvents(this);
        loadCommands(this);
    }

    private readonly defaultPrefix: string;

    public readonly version: string;
    private readonly prefixes: Map<Snowflake, string>;

    public async getPrefix(guildID: Snowflake): Promise<string> {
        const prefix = this.prefixes.get(guildID);
        if (prefix) return prefix;

        const dbPrefix = await this.db.get(`${guildID}.prefix`);
        if (!dbPrefix) {
            this.prefixes.set(guildID, this.defaultPrefix);
            return this.defaultPrefix;
        }

        this.prefixes.set(guildID, dbPrefix);
        return dbPrefix;
    }

    public async setPrefix(guildID: Snowflake, prefix: string): Promise<void> {
        this.prefixes.set(guildID, prefix);
        await this.db.set(`${guildID}.prefix`, prefix);
    }

    public readonly owners: Snowflake[];
    public readonly managers: Snowflake[];

    public readonly messageCommands: Map<string, NostalMessageCommand>;
    public readonly slashCommands: Map<string, NostalSlashCommand>;

    public readonly db: QuickDB;
    public readonly kazagumo: Kazagumo;

    public readonly branding: NostalBrandingOptions;
}

const nostal = new Nostal({
    intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.Guilds
    ],
    version: package_json.version,
    prefix: config.bot.prefix,
    branding: config.branding,

    owners: config.bot.owners,
    managers: config.bot.managers
});

nostal.login(config.bot.token);
