import * as tf from '@tensorflow/tfjs-node';
import * as mobilenet from '@tensorflow-models/mobilenet';

import * as jpeg from 'jpeg-js';

import * as path from 'path';
import { fileURLToPath } from 'url';
import * as fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function decodeImage(imagePath) {
    imagePath = path.join(__dirname, imagePath);

    const buffer = await fs.readFile(imagePath);
    const rawImageData = jpeg.decode(buffer);
    const imageTensor = tf.browser.fromPixels(rawImageData);
    return imageTensor;
}

async function generateImageEmbeddings(imagePath: string) {
    const imageTensor = await decodeImage(imagePath);

    // Load MobileNet model
    const model = await mobilenet.load();

    // Preprocess the image and get the intermediate activation.
    const activation = model.infer(imageTensor, true);

    //to check properly classifying image
    const prediction = await model.classify(imageTensor);
    console.log(`${imagePath} prediction`, prediction);

    // Convert the tensor to a regular array.
    const vectorOutput = await activation.data();

    //imageTensor.dispose();  // Clean up tensor

    const imageEmbeddings: number[] = Array.from(vectorOutput);

    return imageEmbeddings;//DIM 1024
}

export {
    generateImageEmbeddings
}