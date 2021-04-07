import * as Scheduler from "node-schedule";
import MessageStore from "./MessageStore";

export default class StorageCleaner {
    private messageStore: MessageStore;
    private config: Config;

    public constructor(config: Config, messageStore: MessageStore) {
        this.messageStore = messageStore;
        this.config = config;
        this.messageStore.cleanup(); // Run once on init
    }

    public start(): void {
        Scheduler.scheduleJob(this.config.storagecleaninterval, () => {
            this.messageStore.cleanup();
        });
    }
}