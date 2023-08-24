import * as transformers from "@xenova/transformers";

async function generateSentenceEmbeddings(_sentence): Promise<number[]> {
  let modelName = "Xenova/all-distilroberta-v1";
  let pipe = await transformers.pipeline("feature-extraction", modelName);

  let vectorOutput = await pipe(_sentence, {
    pooling: "mean",
    normalize: true,
  });

  const embeddings: number[] = Object.values(vectorOutput?.data);//object to array
  return embeddings;
}

export {
  generateSentenceEmbeddings
}