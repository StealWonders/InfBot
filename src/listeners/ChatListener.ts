import { Listener } from "discord-akairo";
import { Message } from 'discord.js';

export default class ChatListener extends Listener {
    public constructor() {
        super("message", {
            emitter: "client",
            category: "client",
            event: "message"
        });
    }

    public async exec(message: Message): Promise<void> {
//        console.log(`${message.member.user.tag} sent '${message.content}'`);
    }
}
