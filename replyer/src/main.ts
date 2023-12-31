import {connect, NatsConnectionOptions} from "ts-nats";
import PongReplyerController from "~/PongReplyer";

let opts = {} as NatsConnectionOptions;
opts.url = 'localhost:4222';

async function main() {
    let nc = await connect(opts);

    nc.on('permissionError', (err) => {
        nc.close();
        console.log(`${err}`);
    });

    const pong = new PongReplyerController();
    await pong.init(nc);
    pong.subscribe('pong-subject')

}

main();