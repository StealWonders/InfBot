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

    public store(feed: Feed, item: Item) {
        if (!this.storage.entries[feed.url]) {
            this.storage.entries[feed.url] = {};
        }
        this.storage.entries[feed.url][item.link] = item.isoDate;
    }

    public contains(feed: Feed, item: Item): boolean {
        if (!this.storage.entries[feed.url]) return false;
        if (!this.storage.entries[feed.url][item.link]) return false;
        return true;
    }

    public get(feed: Feed, itemUrl: string): Item {
        if (!this.storage.entries[feed.url]) return undefined;
        if (!this.storage.entries[feed.url][itemUrl]) return undefined;
        return { link: itemUrl, isoDate: this.storage.entries[feed.url][itemUrl] };
    }

    public save() {
        fs.writeFile("./storage.json", JSON.stringify(this.storage, null, 4), (err) => {
            if (err) throw err;
        });
    }

    public cleanup() {
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() - this.configuration.historyfor);

        for (const feed in this.storage.entries) {
            for (const key in this.storage.entries[feed]) {
                const originDate = new Date(this.storage.entries[feed][key]);
                if (originDate < maxDate) {
                    delete this.storage.entries[feed][key];
                }
            }
            if (this.countFeedKeys(feed) === 0) {
                delete this.storage.entries[feed];
            }
        }
    }

    public countFeedKeys(feed: string): number {
        return Object.keys(this.storage.entries[feed]).length
    }
}
