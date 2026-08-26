import dotenv from "dotenv";
import { createClient } from "redis";
import { redisClient } from "../redis/client";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const notification_channel = "notifications";

export interface NotificationPayload { 
    id: string,
    title: string,
    message: string,
    createdAt: string,
    updatedAt: string
}

export async function publishNotification(notification: NotificationPayload): Promise<void> { 
    await redisClient.publish(notification_channel, JSON.stringify(notification));
}

const subscriberClient = createClient({ url: redisUrl });

subscriberClient.on("error", (error) => console.error("Redis Subscriber Error", error));

async function startNotificationSubscriber() { 
    await subscriberClient.connect();

    await subscriberClient.subscribe(notification_channel, (message) => { 
        try {
            const notification = JSON.parse(message) as NotificationPayload;

            console.log("new notification recieved!");
            console.log("title", notification.title);
            console.log("message", notification.message);
            console.log("createdAt", notification.createdAt);
        } catch (error) {
            console.log("new notification recieved (new)", message);
        }
    })
} 

startNotificationSubscriber().catch(error => { 
    console.error("Failed to start notification", error);
    process.exit(1);
})
