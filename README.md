## This is a template for implementing microservices using NATS and TypeScript ##
In this repo are samples of implementing controller with reply feature and without it and senders that just sends a message
or wait for a reply. It's recommended to use a single NATS Client and pass it to init() method of a class.

To send a message use NATSPublishers class like this
```typescript
async function main() {
    let nc = await connect(opts);

    nc.on('permissionError', (err) => {
        console.log(`${err}`);
    });

    const request = new NATSPublishers();
    await request.init(nc);
    let counter
    while (true) {
        // First parameter is a subject, second is the request object
        const reply = await request.makeRequest('pong-subject', { counter: counter })
        counter = reply.counter
        console.log(`Got pong with num ${counter}`)
    }
}
```
To implement a controller, inherit NATSController or NATSReplyController class
* NATSController - just processes message without giving a reply
* NATSReplyController - processes message WITH giving a reply, the reply is an object that was returned from onMessage() method

Controller is implemented like this

```typescript
import {NATSReplyController} from "~/NATSWorks";

export default class PongReplyerController extends NATSReplyController {
    override async onMessage(msg: any): Promise<any> {
        // msg field here is an deserialized object
        console.log(`Got message ${String(msg)}`);
        let newCounter = msg.counter;
        if (!newCounter)
            newCounter = 1
        else
            newCounter++
        // controller returns just an object
        return { counter: newCounter }
    }
}
```
Or like this (if controller shouldn't give a reply)
```typescript
import {NATSController} from "~/NATSWorks";

export default class PrintMessageController extends NATSController {
    override async onMessage(msg: any): Promise<any> {
        // msg field here is an deserialized object
        console.log(`Got message ${String(msg)}`);
    }
}
```

Controllers should be initialized like this

```typescript
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
```
