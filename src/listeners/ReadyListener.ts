import { Listener } from "discord-akairo";
import { client } from "../InfBot";

export default class ReadyListener extends Listener {
    public constructor() {
        super("ready", {
            emitter: "client",
            category: "client",
            event: "ready"
        });
    }

    public async exec(): Promise<void> {
        console.log(`${this.client.user.tag} is now online and ready!`);
        client.config.feeds.forEach(client.feedChecker.checkRSS);
    }
}