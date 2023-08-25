import type { RediSearchSchema } from './utils/redis/redis-wrapper.js';

import { PRODUCTS_KEY_PREFIX, PRODUCTS_INDEX_KEY } from "./data.js";
import { getNodeRedisClient, SchemaFieldTypes, VectorAlgorithms } from './utils/redis/redis-wrapper.js';

const createRedisIndex = async () => {
    /*    (RAW COMMAND)
          FT.DROPINDEX Idx:Products
          
          FT.CREATE Idx:Products
          ON JSON
              PREFIX 1 "Products:"
          SCHEMA
          "$.productDisplayName" as productDisplayName TEXT NOSTEM SORTABLE
          "$.brandName" as brandName TEXT NOSTEM SORTABLE
          "$.price" as price NUMERIC SORTABLE
          "$.masterCategory" as "masterCategory" TAG
          "$.subCategory" as subCategory TAG
          "$.productDescriptionEmbeddings" as productDescriptionEmbeddings VECTOR "FLAT" 10
                  "TYPE" FLOAT32
                  "DIM" 768
                  "DISTANCE_METRIC" "L2"
                  "INITIAL_CAP" 111
                  "BLOCK_SIZE"  111
          "$.productDescription" as productDescription TEXT NOSTEM SORTABLE       
          "$.imageURL" as imageURL TEXT NOSTEM       
          "$.productImageEmbeddings" as productImageEmbeddings VECTOR "HNSW" 8
                          "TYPE" FLOAT32
                          "DIM" 1024
                          "DISTANCE_METRIC" "COSINE"
                          "INITIAL_CAP" 111
          
      */
    const nodeRedisClient = getNodeRedisClient();

    const schema: RediSearchSchema = {
        '$.productDisplayName': {
            type: SchemaFieldTypes.TEXT,
            NOSTEM: true,
            SORTABLE: true,
            AS: 'productDisplayName',
        },
        '$.brandName': {
            type: SchemaFieldTypes.TEXT,
            NOSTEM: true,
            SORTABLE: true,
            AS: 'brandName',
        },
        '$.price': {
            type: SchemaFieldTypes.NUMERIC,
            SORTABLE: true,
            AS: 'price',
        },
        '$.masterCategory': {
            type: SchemaFieldTypes.TAG,
            AS: 'masterCategory',
        },
        '$.subCategory': {
            type: SchemaFieldTypes.TAG,
            AS: 'subCategory',
        },
        '$.productDescriptionEmbeddings': {
            type: SchemaFieldTypes.VECTOR,
            TYPE: 'FLOAT32',
            ALGORITHM: VectorAlgorithms.FLAT,
            DIM: 768,
            DISTANCE_METRIC: 'L2',
            INITIAL_CAP: 111,
            BLOCK_SIZE: 111,
            AS: 'productDescriptionEmbeddings',
        },
        '$.productDescription': {
            type: SchemaFieldTypes.TEXT,
            NOSTEM: true,
            SORTABLE: true,
            AS: 'productDescription',
        },
        '$.imageURL': {
            type: SchemaFieldTypes.TEXT,
            NOSTEM: true,
            AS: 'imageURL',
        },
        '$.productImageEmbeddings': {
            type: SchemaFieldTypes.VECTOR,
            TYPE: "FLOAT32",
            ALGORITHM: VectorAlgorithms.HNSW,
            DIM: 1024,
            DISTANCE_METRIC: 'COSINE',
            INITIAL_CAP: 111,
            AS: 'productImageEmbeddings',
        },
        // '$.productImageEmbeddings': {
        //     type: SchemaFieldTypes.VECTOR,
        //     TYPE: 'FLOAT32',
        //     ALGORITHM: VectorAlgorithms.FLAT,
        //     DIM: 1024,
        //     DISTANCE_METRIC: 'L2',
        //      INITIAL_CAP: 111,
        //      BLOCK_SIZE: 111,
        //     AS: 'productImageEmbeddings',
        // },
    };
    console.log(`index ${PRODUCTS_INDEX_KEY} created`);

    try {
        await nodeRedisClient.ft.dropIndex(PRODUCTS_INDEX_KEY);
    } catch (indexErr) {
        console.error(indexErr);
    }
    await nodeRedisClient.ft.create(PRODUCTS_INDEX_KEY, schema, {
        ON: 'JSON',
        PREFIX: PRODUCTS_KEY_PREFIX,
    });
};

export {
    createRedisIndex
}