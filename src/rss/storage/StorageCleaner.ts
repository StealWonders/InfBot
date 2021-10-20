import * as Scheduler from "node-schedule";
import Configuration from "../../Configuration";
import MessageStorage from "./MessageStorage";

export default class StorageCleaner {

    private messageStorage: MessageStorage;
    private configuration: Configuration;

    public constructor(configuration: Configuration, messageStorage: MessageStorage) {
        this.messageStorage = messageStorage;
        this.configuration = configuration;
        this.messageStorage.cleanup(); // Run once on init
    }

    public start() {
        Scheduler.scheduleJob(this.configuration.storagecleaninterval, () => {
            this.messageStorage.cleanup();
            this.messageStorage.save();
        });
    }
}