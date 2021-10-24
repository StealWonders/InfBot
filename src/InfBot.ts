import { Client, ClientOptions, Intents } from "discord.js"
import Configuration from "./Configuration";
import MessageStorage from "./rss/storage/MessageStorage";
import StorageCleaner from "./rss/storage/StorageCleaner";
import FeedChecker from "./rss/FeedChecker"
const configuration: Configuration = require("../config.json");

export default class InfBot extends Client {

    public readonly configuration: Configuration;
    public readonly messageStorage: MessageStorage;
    public readonly storageCleaner: StorageCleaner;
    public readonly feedChecker: FeedChecker;

    constructor(options: ClientOptions, configuration: Configuration) {
        super(options);

        this.configuration = configuration;
        this.messageStorage = new MessageStorage(this.configuration);
        this.storageCleaner = new StorageCleaner(this.configuration, this.messageStorage);
        this.feedChecker = new FeedChecker(this);

        this.feedChecker.start();
        this.storageCleaner.start();

        this.once("ready", () => {
            console.log(`Ready to serve! Logged in as ${this.user.tag}`);
        });

        this.on("rateLimit", (rateLimitData) => {
            console.log(`Rate limit of ${rateLimitData.limit} has been reached! Timeout for ${rateLimitData.timeout}ms`);
        });

        this.login(this.configuration.token);
    }

}

const infBot = new InfBot({ intents: [Intents.FLAGS.GUILDS] }, configuration);
