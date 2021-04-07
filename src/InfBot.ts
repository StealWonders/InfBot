import BotClient from "./client/BotClient";
import { token, owners, feeds, historyfor, rsspollinterval, storagecleaninterval, resourcetypes, filestatus, subjects } from "../config.json";

const client: BotClient = new BotClient({token, owners, feeds, historyfor, rsspollinterval, storagecleaninterval, resourcetypes, filestatus, subjects});
client.start();