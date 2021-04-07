interface Config {
    token?: string;
    owners?: string | string[];
    feeds?: Feed[];
    historyfor?: number,
    rsspollinterval?: string;
    storagecleaninterval?: string;
    resourcetypes?: {
        [key: string]: string;
    }
    filestatus?: {
        [key: string]: string;
    }
    subjects?: {
        [key: string]: Subject;
    }
}