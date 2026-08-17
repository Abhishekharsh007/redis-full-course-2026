// string
// hash
// list
// set
// sorted set
// ttl


// string
// stores one value under one key
// plain text, numbers stored as text, counters
// key: page_views
// value: "100"

import dotenv from "dotenv";
import { createClient } from 'redis';

dotenv.config();

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const redis = createClient({ url: redisUrl });

async function run() { 
    // open connection to redis server
    await redis.connect();
    console.log("connected to redis");
    console.log("ping", await redis.ping());

    // 1. string
    const stringKey = "demo:page_views";
    await redis.set(stringKey, "100");

    const pageviews = await redis.get(stringKey);
    console.log(pageviews);  // => 100

    // redis strings can also work like counters
    const afterIncr = await redis.incr(stringKey);
    console.log(afterIncr, " ", pageviews);  // => 101 100


    // 2. hash
    // stores many small fields under one key - small object or map inside redis

    // key: keyname
    // fields:
    // name -> "abhishek"
    // fields -> "email"

    const hashKey = "demo:user:profile";
    await redis.hSet(hashKey, {
        name: "Abhishek",
        city: "patna",
    });

    const extractProfileInfo = await redis.hGetAll(hashKey);
    console.log(extractProfileInfo);  // => { name: 'Abhishek', city: 'patna' }


    // 3. list
    // redis list ordered collection of values
    const listKey = "demo2:messages";
    await redis.lPush(listKey, "hello");
    await redis.lPush(listKey, "hi, redis");
    await redis.rPush(listKey, "Tata");
    await redis.rPush(listKey, "Good Bye");

    const extractMessages2 = await redis.lRange(listKey, 0, -1);
    console.log(extractMessages2);  // => [ 'hi, redis', 'hello', 'Tata', 'Good Bye' ]

    // lPush - adds a new item at the beginning
    // lRange - read items from the list
    // rPush - adds a new item at the end
    // ltrim - keeps only part of the list


    // 4. set
    // sets unique sets of values only
    const setKey = "demo:tags";
    await redis.sAdd(setKey, "nodejs");
    await redis.sAdd(setKey, "nextjs");
    await redis.sAdd(setKey, "nextjs");

    const tagCount = await redis.sCard(setKey);
    console.log(tagCount);

    const rankKey = "demo:leaderboard";
    await redis.zAdd(rankKey, { score: 100, value: "player_a" });
    await redis.zAdd(rankKey, { score: 200, value: "player_b" });

    const newScore = await redis.zIncrBy(rankKey, 50, "player_a");
    console.log(newScore);  // => 150

    const rank = await redis.zRevRank(rankKey, "player_b");
    console.log(rank);  // => 0  /*0 = top Rank*/


    // 4 TTL(expiry) -> time to live
    // It tells redis how long a key should exists before being deleted automatically

    // key - a
    // value: "345"
    // ttl: 300 second
    // after 5 min redis is going to delete this key automatically

    const otpKey = "demo:otp";
    await redis.set(otpKey, "123456");
    await redis.expire(otpKey, 60);

    const ttl = await redis.ttl(otpKey);
    console.log(ttl);

    await redis.quit();
}

run().catch((err) => { 
    console.error("Failed demo: ", err);
    process.exit(1);
})
