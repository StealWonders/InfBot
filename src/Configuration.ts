import { Feed, Subject } from "./rss/types";

export default interface Configuration {
    token?: string;
    owners?: string | string[];
    feeds?: Feed[];
    historyfor?: number,
    rsspollinterval?: string;
    storagecleaninterval?: string;
    resourcetypes?: Record<string, string>;
    filestatus?: Record<string, string>;
    subjects?: Record<string, Subject>;
}
