import { Item } from "rss-parser";
import * as fs from "fs";
import { Feed, FeedStorage } from "../types";
import Configuration from "../../Configuration";
const storage = require("../../../storage.json");

export default class MessageStorage {

    private configuration: Configuration;
    private storage: FeedStorage;

    public constructor(configuration: Configuration) {
        this.configuration = configuration;
        this.storage = { entries: storage.entries };
    }

    public store(feed: Feed, item: Item): void {
        if (this.storage.entries[feed.url] == undefined) {
            this.storage.entries[feed.url] = {};
        }
        this.storage.entries[feed.url][item.link] = item.isoDate;
    }

    public contains(feed: Feed, item: Item): boolean {
        if (this.storage.entries[feed.url] == undefined) return false;
        if (this.storage.entries[feed.url][item.link] == undefined) return false;
        return true;
    }

    public save(): void {
        fs.writeFile("./storage.json", JSON.stringify(this.storage, null, 4), err => {
            if (err) throw err;
        });
    }

    public cleanup(): void {
        const maxDate: Date = new Date();
        maxDate.setDate(maxDate.getDate() - this.configuration.historyfor);

        for (const feed in this.storage.entries) {
            for (const key in this.storage.entries[feed]) {
                const originDate = new Date(this.storage.entries[feed][key]);
                if (originDate < maxDate) {
                    delete this.storage.entries[feed][key];
                }
            }
            if (this.countFeedKeys(feed) == 0) {
                delete this.storage.entries[feed];
            }
        }
    }

    public countFeedKeys(feed: string): number {
        let count = 0;
        for (const key in this.storage.entries[feed]) {
            count++;
        }
        return count;
    }
}