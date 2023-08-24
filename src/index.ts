import dotenv from 'dotenv';

import { products } from "./data.js";
import { generateSentenceEmbeddings } from "./text-vector-gen.js";
import { generateImageEmbeddings } from "./image-vector-gen.js";

import { setRedis, getNodeRedisClient } from './utils/redis/redis-wrapper.js';

dotenv.config();

//--- config
const REDIS_URI = process.env.REDIS_URI || "";
//--- config ends

async function addProductWithEmbeddings(_products) {
    const nodeRedisClient = getNodeRedisClient();

    if (_products && _products.length) {
        for (let product of _products) {

            console.log(`generating description embeddings for product ${product._id}`);
            const sentenceEmbedding = await generateSentenceEmbeddings(product.productDescription);
            product["productDescriptionEmbeddings"] = sentenceEmbedding;

            console.log(`generating image embeddings for product ${product._id}`);
            const imageEmbedding = await generateImageEmbeddings(product.imageURL);
            product["productImageEmbeddings"] = imageEmbedding;

            await nodeRedisClient.json.set(`Products:${product._id}`, "$", {
                ...product
            });
            console.log(`product ${product._id} added to redis`);
        }
    }
}

async function testVectorGeneration() {
    const embeddings = await generateSentenceEmbeddings('I Love Redis !');
    console.log(embeddings);

    const imageEmbeddings = await generateImageEmbeddings("images/11001.jpg");
    console.log(imageEmbeddings);
}
async function init() {
    //await testVectorGeneration();

    await setRedis(REDIS_URI);
    await addProductWithEmbeddings(products);
    process.exit(0);
}

init();