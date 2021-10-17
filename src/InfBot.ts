import { Client, ClientOptions, Intents } from "discord.js"
import Configuration from "./Configuration";
import MessageStorage from "./rss/storage/MessageStorage";
import StorageCleaner from "./rss/storage/StorageCleaner";
import FeedChecker from "./rss/FeedChecker"
const configuration: Configuration = require("../config.json");

export default class InfBot extends Client {

    private _configuration: Configuration;
    private _messageStorage: MessageStorage;
    private _storageCleaner: StorageCleaner;
    private _feedChecker: FeedChecker;

    constructor(options: ClientOptions, configuration: Configuration) {
        super(options);
        this._configuration = configuration;
        this._messageStorage = new MessageStorage(this.configuration);
        this._storageCleaner = new StorageCleaner(this.configuration, this.messageStorage);
        this._feedChecker = new FeedChecker(this);

        this.feedChecker.start();
        this.storageCleaner.start();

        this.once("ready", () => {
            console.log(`Ready to serve! Logged in as ${this.user.tag}`);
        });

        this.on("rateLimit", rateLimitData => {
            console.log(`Rate limit of ${rateLimitData.limit} has been reached! Timeout for ${rateLimitData.timeout}ms`);
            rateLimitData.limit
        });

        this.login(this.configuration.token);
    }

    public get configuration() {
        return this._configuration;
    }

    public get messageStorage() {
        return this._messageStorage;
    }

    public get storageCleaner() {
        return this._storageCleaner;
    }

    public get feedChecker() {
        return this._feedChecker;
    }

}

const infBot = new InfBot({ intents: [Intents.FLAGS.GUILDS] }, configuration);