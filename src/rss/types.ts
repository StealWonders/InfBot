import { HexColorString } from "discord.js";

export interface Feed {
    url: string;
    channels: string[];
}

export interface Subject {
    name: string;
    color: HexColorString;
    iconUrl?: string;
}

export interface FileStatus {
    identifier: String;
    icon: String;
}

export interface ParsedItem {
    subject: Subject;
    statusIcon?: string;
    fileName: string;
    filePath: string;
}

export interface StorageContainer {
    [key: string]: string;
}

export interface FeedStorage {
    entries?: Record<string, StorageContainer>;
}