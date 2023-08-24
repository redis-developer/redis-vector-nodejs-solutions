import {
    createClient, commandOptions, SchemaFieldTypes, VectorAlgorithms,
    //types
    RediSearchSchema,
} from 'redis';
import {
    //types
    Entity as RedisEntity,
    RedisConnection,
    //values
    Schema as RedisSchema,
    Repository as RedisRepository,
    EntityId as RedisEntityId,
} from 'redis-om';

import { LoggerCls } from '../logger.js';

class RedisWrapperCls {
    connectionURL: string;
    nodeRedisClient: RedisConnection | null;

    constructor(_connectionURL: string) {
        this.connectionURL = _connectionURL;
        this.nodeRedisClient = null;
    }

    async getConnection() {
        if (!this.nodeRedisClient && this.connectionURL) {
            this.nodeRedisClient = createClient({ url: this.connectionURL });

            this.nodeRedisClient.on('error', (err) => {
                LoggerCls.error('Redis Client Error', err);
            });

            await this.nodeRedisClient.connect();
            LoggerCls.info('redis-wrapper ', 'Connected successfully to Redis');
        }
        return this.nodeRedisClient;
    }

    async closeConnection(): Promise<void> {
        if (this.nodeRedisClient) {
            await this.nodeRedisClient.disconnect();
        }
    }
}

let redisWrapperInst: RedisWrapperCls;

const setRedis = async (_connectionURL: string) => {
    redisWrapperInst = new RedisWrapperCls(_connectionURL);
    const nodeRedisClient = await redisWrapperInst.getConnection();
    return nodeRedisClient;
};

const getRedis = (): RedisWrapperCls => {
    return redisWrapperInst;
};
const getNodeRedisClient = () => {
    if (!redisWrapperInst.nodeRedisClient) {
        throw 'nodeRedisClient is not created!';
    }
    return redisWrapperInst.nodeRedisClient;
};

export {
    setRedis,
    getRedis,
    getNodeRedisClient,
    commandOptions,
    RedisSchema,
    RedisRepository,
    RedisEntityId,
    SchemaFieldTypes,
    VectorAlgorithms
};

export type { RedisWrapperCls, RedisEntity, RediSearchSchema };
