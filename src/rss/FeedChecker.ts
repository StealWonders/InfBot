import { BaseGuildTextChannel, Channel, MessageEmbed, NewsChannel, TextChannel } from "discord.js";
import * as Scheduler from "node-schedule";
import Parser, { Item } from "rss-parser";
import InfBot from "../InfBot"
import { Feed, ParsedItem, Subject } from "./types";

export default class FeedChecker {

    private infBot: InfBot;

    public constructor(infBot: InfBot) {
        this.infBot = infBot;
    }

    public start() {
        Scheduler.scheduleJob(this.infBot.configuration.rsspollinterval, () => {
            for (const feed of this.infBot.configuration.feeds) {
                console.log("Checking: " + feed.url);
                this.checkRSS(feed);
            }
        });

        // Check once directly after startup
        for (const feed of this.infBot.configuration.feeds) {
            console.log("Checking: " + feed.url);
            this.checkRSS(feed);
        }
    }

    public async checkRSS(feed: Feed) {
        try {
            const parser = new Parser();
            const parsedFeed = await parser.parseURL(feed.url);

            const maxDate = new Date();
            maxDate.setDate(maxDate.getDate() - this.infBot.configuration.historyfor);

            const embeds: MessageEmbed[] = [];

            for (const item of parsedFeed.items) {
                const resourceIcon: string = this.getResourceIcon(item);
                if (!resourceIcon) continue // Only send non forum items

                // Skip feed entry as it's original date is too far back
                const originDate = new Date(item.isoDate);
                if (originDate < maxDate) break; // If the current item is already past the max date then dont check the rest

                const parsedItem = this.parseItem(item);
                if (!parsedItem) continue; // If the item is unable to be parsed, skip

                //Check if the message is already sent (by checking storage)
                if (this.infBot.messageStorage.contains(feed, item)) continue;
                this.infBot.messageStorage.store(feed, item);

                // Item is not in storage → Send message
                let fileName: string = parsedItem.fileName;
                fileName = fileName.replace("/*/g", "\\*");
                fileName = fileName.replace("/_/g", "\\_");

                const embed: MessageEmbed = new MessageEmbed()
                    .setTitle(fileName + " " + (parsedItem.statusIcon || ''))
                    .setDescription(parsedItem.filePath)
                    .setColor(parsedItem.subject.color)
                    .setTimestamp(originDate)
                    .setThumbnail(parsedItem.subject.iconUrl)
                    .setAuthor(parsedItem.subject.name)
                    .setURL(item.link);

                embeds.push(embed);
            }

            // embeds = embeds.reverse();

            const messages: MessageEmbed[][] = [];

            while (embeds.length > 0) {
                const message: MessageEmbed[] = [];
                while (message.length < 10 && embeds.length > 0) {
                    message.push(embeds.pop());
                }
                messages.push(message);
            }

            if (messages.length == 0) return;

            for (const channelId of feed.channels) {
                const channel: Channel = await this.infBot.channels.fetch(channelId);
                if ((channel instanceof TextChannel) || (channel instanceof NewsChannel)) {
                    for (const message of messages) {
                        const sentMessage = await (channel as BaseGuildTextChannel).send({ embeds: message});
                        if (channel instanceof NewsChannel) {
                            sentMessage.crosspost();
                        }
                    }
                    console.log(`Updates sent to ${channelId}`);
                } else {
                    console.error(`${channelId} is not a valid text channel!`)
                    return;
                }
            }

            this.infBot.messageStorage.save();
        } catch (exception) {
            console.error(exception);
        }
    }

    private getResourceIcon(item: Item): string {
        const target = new URL(item.link).searchParams.get('target');
        const targetType = target.split('_')[0]; // https://www.studon.fau.de/studon/goto.php? client_id=StudOn & target=file_3703555
        return this.infBot.configuration.resourcetypes[targetType];
    }

    private parseItem(item: Item): ParsedItem {
        const split = item.title.split('] ');
        const nameAndStatus = split[split.length - 1].split(': ');
        const fileName = nameAndStatus[0];
        const fileStatusIdentifier = nameAndStatus[1];

        split.splice(split.length - 1);
        const filePath = split.join('] ').substring(1);
        const subjectIdentifier = filePath.split(' > ')[0];
        
        const subject = this.infBot.configuration.subjects[subjectIdentifier];
        const statusIcon = this.infBot.configuration.filestatus[fileStatusIdentifier];

        if (!subject || !fileName || !filePath) return undefined;

        return { subject, fileName, statusIcon, filePath };
    }
}
