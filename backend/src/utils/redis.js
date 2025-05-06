import {createClient} from "redis";

const client = createClient();
client.on('error', err => console.log('Redis Client Error', err));
await client.connect();

const getOrSetCache = async (key, dbQuery, ttl = 3600) => {

    try {
        // Check if data exists in cache
        const cacheData = await client.get(key);
        if (cacheData) {
            await client.expire(key, ttl);
            return JSON.parse(cacheData);
        }

        // Fetch data from database
        const data = await dbQuery();
        if(data) {
            await client.setEx(key, ttl, JSON.stringify(data)); // save data in cache with expiration
        }
        return data; 
    } catch (error) {
        console.error("Redis cache error:", error);
        return dbQuery(); // fallback to DB query if redis fails
    }
};

export { getOrSetCache };
