import dotenv from 'dotenv';
import * as cheerio from 'cheerio';

import { products, PRODUCTS_KEY_PREFIX } from "./data.js";
import { generateSentenceEmbeddings } from "./text-vector-gen.js";
import { generateImageEmbeddings } from "./image-vector-gen.js";
import { createRedisIndex } from "./redis-index.js"
import {
    queryProductDescriptionEmbeddingsByKNN,
    queryProductImageEmbeddingsByKNN
} from "./knn-query.js";
import { queryProductDescriptionEmbeddingsByRange } from "./range-query.js"
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

            console.log(`generating image embeddings for product ${product._id}`);
            const imageEmbedding = await generateImageEmbeddings(product.imageURL);
            product["productImageEmbeddings"] = imageEmbedding;

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

async function testVectorQueryByKNNandRangeForText() {
    const result = await queryProductDescriptionEmbeddingsByKNN("Puma watch with cat", 3);
    console.log(JSON.stringify(result, null, 4));

    const result2 = await queryProductDescriptionEmbeddingsByRange("Puma watch with cat", 1.0);
    console.log(JSON.stringify(result2, null, 4));
}

async function testVectorQueryByKNNandRangeForImage() {
    const result = await queryProductImageEmbeddingsByKNN("images/11001.jpg", 3);
    console.log(JSON.stringify(result, null, 4));
}

async function init() {

    await setRedis(REDIS_URI);
    await createRedisIndex();
    await addProductWithEmbeddings(products);

    //await testVectorGeneration();
    await testVectorQueryByKNNandRangeForText();
    //await testVectorQueryByKNNandRangeForImage();

    process.exit(0);
}

init();

