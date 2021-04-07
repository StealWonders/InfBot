import { Listener } from "discord-akairo";
import { RateLimitData } from 'discord.js';

export default class RateLimitListener extends Listener {
    public constructor() {
        super("rateLimit", {
            emitter: "client",
            category: "client",
            event: "rateLimit"
        });
    }

    public async exec(info: RateLimitData): Promise<void> {
        console.warn(`Rate limit hit ${info.timeDifference ? info.timeDifference : info.timeout ? info.timeout : 'Unknown timeout'}`);
    }
}