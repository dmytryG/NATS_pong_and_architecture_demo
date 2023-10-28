import {NATSReplyController} from "~/NATSWorks";

export default class PongReplyerController extends NATSReplyController {
    override async onMessage(msg: any): Promise<any> {
        console.error(`Got message ${String(msg)}`);
        let newCounter = msg.counter;
        if (!newCounter)
            newCounter = 1
        else
            newCounter++
        return { counter: newCounter }
    }
}