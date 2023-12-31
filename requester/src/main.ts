import {connect, NatsConnectionOptions} from "ts-nats";
import {NATSPublishers} from "~/NATSWorks";

const subject = 'new-subject';
const payload = 'payload lol';

let opts = {} as NatsConnectionOptions;
opts.url = 'localhost:4222';

function usage() {
    console.log('tsnode-req [-s <server>] [-creds file] [-nkey file] [-timeout millis] <subject> [data]');
    process.exit(-1);
}

async function main() {
    let nc = await connect(opts);

    nc.on('permissionError', (err) => {
        console.log(`${err}`);
    });

    const request = new NATSPublishers();
    await request.init(nc);
    let counter
    while (true) {
        const reply = await request.makeRequest('pong-subject', { counter: counter })
        counter = reply.counter
        console.log(`Got pong with num ${counter}`)
    }
}

main();