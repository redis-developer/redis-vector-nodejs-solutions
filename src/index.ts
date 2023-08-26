import dotenv from 'dotenv';
import * as cheerio from 'cheerio';

import { products, PRODUCTS_KEY_PREFIX } from "./data.js";
import { generateSentenceEmbeddings } from "./text-vector-gen.js";
import { generateImageEmbeddings } from "./image-vector-gen.js";
import { createRedisIndex } from "./redis-index.js"
import { queryProductDescriptionEmbeddingsByKNN } from "./knn-query.js";

import { setRedis, getNodeRedisClient } from './utils/redis/redis-wrapper.js';

dotenv.config();

//--- config
const REDIS_URI = process.env.REDIS_URI || "";
//--- config ends

function stripHTML(htmlContent) {
    const $ = cheerio.load(htmlContent);
    return $.text();
}

async function addProductWithEmbeddings(_products) {
    const nodeRedisClient = getNodeRedisClient();

    if (_products && _products.length) {
        for (let product of _products) {

            console.log(`generating description embeddings for product ${product._id}`);
            const strippedText = stripHTML(product.productDescription);
            product["productDescription"] = strippedText;
            const sentenceEmbedding = await generateSentenceEmbeddings(strippedText);
            product["productDescriptionEmbeddings"] = sentenceEmbedding;

            // console.log(`generating image embeddings for product ${product._id}`);
            // const imageEmbedding = await generateImageEmbeddings(product.imageURL);
            // product["productImageEmbeddings"] = imageEmbedding;

            await nodeRedisClient.json.set(`${PRODUCTS_KEY_PREFIX}:${product._id}`, "$", {
                ...product
            });
            console.log(`product ${product._id} added to redis`);
        }
    }
}

async function testVectorGeneration() {
    const embeddings = await generateSentenceEmbeddings("I Love Redis !");
    console.log(embeddings);

    const imageEmbeddings = await generateImageEmbeddings("images/11001.jpg");
    console.log(imageEmbeddings);
}

async function testVectorQueryByKNN() {
    const result = await queryProductDescriptionEmbeddingsByKNN("Puma watch with cat", 3);
    console.log(JSON.stringify(result, null, 4));
}
async function init() {

    await setRedis(REDIS_URI);
    // await createRedisIndex();
    // await addProductWithEmbeddings(products);

    //await testVectorGeneration();
    await testVectorQueryByKNN(); //TODO: API ?

    process.exit(0);
}

init();


//TODO: write vector queries to file -  logs/01-json-data.log, logs/02-index.log , logs/03-knn-query.log