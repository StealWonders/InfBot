import * as Scheduler from "node-schedule";
import Parser, { Item } from "rss-parser";
import { AkairoClient } from "discord-akairo";
import { MessageEmbed, Channel } from "discord.js";
import { TextChannel } from "discord.js";
import MessageStore from "./storage/MessageStore";

export default class FeedChecker {
    private client: AkairoClient;
    private config: Config;
    private messageStore: MessageStore;

    public constructor(client: AkairoClient, messageStore: MessageStore, config: Config) {
        this.client = client;
        this.config = config;
        this.messageStore = messageStore;
    }

    public start(): void {
        Scheduler.scheduleJob(this.config.rsspollinterval, () => {
            for (const feed of this.config.feeds) {
//                console.log("Checking: " + feed.url);
                this.checkRSS(feed);
            }
        });
    }

    public async checkRSS(feed: Feed): Promise<void> {
        const parser = new Parser();
        const parsedFeed = await parser.parseURL(feed.url);

        const maxDate: Date = new Date();
        maxDate.setDate(maxDate.getDate() - this.config.historyfor);

        for (const item of parsedFeed.items) {
            const resourceIcon: string = this.getResourceIcon(item);
            if (resourceIcon != undefined) { // Only send non forum items

                // Skip feed entry as it's original date is too far back
                const originDate = new Date(item.isoDate);
                if (originDate < maxDate) break; // If the current item is already past the max date then dont check the rest

                const parsedItem: ParsedItem = this.parseItem(item);
                if (parsedItem == undefined) continue; // If the item is unable to be parsed, skip

                //Check if the message is already sent (by checking storage)
                if (this.messageStore.contains(feed, item)) continue;
                this.messageStore.store(feed, item);

                // Item is not in storage → Send message
                let fileName: string = parsedItem.fileName;
                fileName = fileName.replace("/*/g", "\\*");
                fileName = fileName.replace("/_/g", "\\_");

                const message: MessageEmbed = new MessageEmbed()
                    .setTitle((parsedItem.statusIcon || '') + " " + resourceIcon + " " + parsedItem.subject.icon + " " + fileName)
                    .setColor(parsedItem.subject.color)
                    .setURL(item.link)
                    .setAuthor(parsedItem.subject.name)  
                    .setDescription("```" + parsedItem.filePath + "```");

                for (const channelId of feed.channels) {
                    const channel: Channel = await this.client.channels.fetch(channelId);
                    if (channel instanceof TextChannel) {
                        await (channel as TextChannel).send(message);
                        console.log(`Found and sent: '${message.title}'`);
                    } else {
                        console.error(`${channelId} is not a valid text channel!`)
                    }
                }
            }
        }
        this.messageStore.save();
    }

    private getResourceIcon(item: Item): string {
        const target: string = new URL(item.link).searchParams.get('target');
        const targetType: string = target.split('_')[0]; // https://www.studon.fau.de/studon/goto.php? client_id=StudOn & target=file_3703555
        return this.config.resourcetypes[targetType];
    }

    private parseItem(item: Item): ParsedItem {
        const split: string[] = item.title.split('] ');
        const nameAndStatus: string[] = split[split.length - 1].split(': ');
        const fileName: string = nameAndStatus[0];
        const fileStatusIdentifier: string = nameAndStatus[1];

        split.splice(split.length - 1);
        const filePath: string = split.join('] ').substring(1);
        const subjectIdentifier: string = filePath.split(' > ')[0];
        
        const subject: Subject = this.config.subjects[subjectIdentifier];
        const statusIcon: string = this.config.filestatus[fileStatusIdentifier];

        if (subject == undefined || fileName == undefined || filePath == undefined) return undefined;

        return {subject, fileName, statusIcon, filePath};
    }
}
