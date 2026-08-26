// publish & subscribe
// publisher sends a message
// subscriber listens and recieves the messages
// channel is the topic name both sides use

import dotenv from "dotenv";
import { createClient } from "redis";

dotenv.config();

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const channel = "demo:notifications";

async function run() { 
    // need two clients
    // one client will be to publish and second one to subscribe

    const publisher = createClient({ url: redisUrl });
    const subscriber = createClient({ url: redisUrl });

    await publisher.connect();
    await subscriber.connect();

    console.log("publisher connected");
    console.log("subscriber connected");
    console.log("ping ->", await publisher.ping());
    console.log("subscriber listens");

    await subscriber.subscribe(channel, (message) => {
        const data = JSON.parse(message);
        console.log("subscriber recieved");
        console.log("title", data.title);
        console.log("message", data.message);
    });

    console.log("subscribed to channel", channel);

    console.log("publisher is now sending event");

    const event = {
        title: "redis course",
        message: "pub/sub demo"
    }

    const recievers = await publisher.publish(channel, JSON.stringify(event));
    console.log("published event");
    console.log("active subscribers", recievers);   

    await new Promise((resolve) => setTimeout(resolve, 300));

    await subscriber.unsubscribe(channel);
    await subscriber.quit();
    await publisher.quit();

    console.log("pub/sub demo done");
}

run().catch((error) => {
  console.error("Pub/sub demo failed:", error);
  process.exit(1);
});
