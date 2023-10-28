import {Client, connect, Msg, NatsConnectionOptions} from "ts-nats";

class NATSPublishers {
    opts = {} as NatsConnectionOptions;
    nc: Client
    constructor(url: string = 'localhost:4222') {
        this.opts.url = url;
    }

    async init(client: Client | undefined = undefined): Promise<void> {
        if (!client)
            this.nc = await connect(this.opts);
        else
            this.nc = client
        this.nc.on('permissionError', (err) => {
            console.log(`${err}`);
        });
    }

    async makeRequest(subject: string, data: any, max: number = -1): Promise<any | undefined> {
        max = parseInt(max.toString(), 10);
        if (max < 1) {
            max = 1000;
        }
        const payload = JSON.stringify(data)
        const message = await this.nc.request(subject, max, payload);
        if (!message.data)
            return undefined;
        return JSON.parse(message.data)
    }

    async publish(subject: string, data: any): Promise<any> {
        const payload = JSON.stringify(data)
        this.nc.publish(subject, payload);
        await this.nc.flush()
    }
}

class NATSController {
    opts = {} as NatsConnectionOptions;
    nc: Client
    constructor(url: string = 'localhost:4222') {
        this.opts.url = url;
    }

    async init(client: Client | undefined = undefined): Promise<void> {
        if (!client)
            this.nc = await connect(this.opts);
        else
            this.nc = client
        this.nc.on('permissionError', (err) => {
            console.log(`${err}`);
        });
    }

    async subscribe(subject: string): Promise<any> {
        await this.nc.subscribe(subject, async (err, msg) => {
            if (err) {
                console.error(`[] error processing message [${err.message} - ${msg}`);
                return;
            }
            if (msg) {
                const msgData = JSON.parse(msg.data)
                await this.onMessage(msgData)
            }
        });
    }

    async onMessage(msg: any): Promise<void> {
        console.error(`Got message ${msg}`);
    }
}

class NATSReplyController {
    opts = {} as NatsConnectionOptions;
    nc: Client
    constructor(url: string = 'localhost:4222') {
        this.opts.url = url;
    }

    async init(client: Client | undefined = undefined): Promise<void> {
        if (!client)
            this.nc = await connect(this.opts);
        else
            this.nc = client
        this.nc.on('permissionError', (err) => {
            console.log(`${err}`);
        });
    }

    subscribe(subject: string): any {
        this.nc.subscribe(subject, async (err, msg) => {
            if (err) {
                console.error(`[] error processing message [${err.message} - ${msg}`);
                return;
            }
            if (msg && msg.reply) {
                const msgData = JSON.parse(msg.data)
                const response = await this.onMessage(msgData)
                const payload = JSON.stringify(response)
                this.nc.publish(msg.reply, payload)
            }
        });
    }

    async onMessage(msg: any): Promise<any> {
        console.error(`Got message ${msg.data}`);
        return {}
    }
}

export { NATSPublishers, NATSController, NATSReplyController }