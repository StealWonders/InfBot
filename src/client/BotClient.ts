import { AkairoClient, CommandHandler, ListenerHandler } from "discord-akairo";
import { join } from "path";
import FeedChecker from "../rss/FeedChecker";
import MessageStore from "../rss/storage/MessageStore";
import StorageCleaner from "../rss/storage/StorageCleaner";

declare module "discord-akairo" {
    interface AkairoClient {
        commandHandler: CommandHandler;
        listenerHandler: ListenerHandler;
    }
}

export default class BotClient extends AkairoClient {
    private config: Config;
    private messageStore: MessageStore;
    private feedChecker: FeedChecker;
    private storageCleaner: StorageCleaner;

    public constructor(config: Config) {
        super({
            ownerID: config.owners
        });
        this.config = config;
    }

    public listenerHandler: ListenerHandler = new ListenerHandler(this, {
        directory: join(__dirname, "..", "listeners")
    });

    private async _init(): Promise<void> {
        //this.commandHandler.useListenerHandler(this.listenerHandler);
        this.listenerHandler.setEmitters({
            //commandHandler: this.commandHandler,
            listenerHandler: this.listenerHandler,
            process
        });

        //this.commandHandler.loadAll();
        this.listenerHandler.loadAll();

        this.messageStore = new MessageStore(this.config);
        this.feedChecker = new FeedChecker(this, this.messageStore, this.config);
        this.feedChecker.start();
        this.storageCleaner = new StorageCleaner(this.config, this.messageStore);
        this.storageCleaner.start();
    }

    public async start(): Promise<string> {
        await this._init();
        return this.login(this.config.token);
    }
}