import BotClient from "./client/BotClient";
const config = require("../config.json");

const client: BotClient = new BotClient(config);
client.start();