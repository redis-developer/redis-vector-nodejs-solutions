import { getNodeRedisClient } from './utils/redis/redis-wrapper.js';
import { generateSentenceEmbeddings } from "./text-vector-gen.js";
import { PRODUCTS_INDEX_KEY } from "./data.js";

const getVectorForRedisInsight = (arr) => {

    // like 2 digit hexadecimal  (for Redis Insight))
    const floatArray = new Float32Array(arr);
    let hexString = '';
    for (const floatValue of floatArray) {
        const float32Array = new Float32Array(1);
        float32Array[0] = floatValue;

        const buffer = new Uint8Array(float32Array.buffer);

        for (const byte of buffer) {
            hexString += `\\x${byte.toString(16).padStart(2, '0')}`;
        }
    }
    return hexString;
}

const float32Buffer = (arr) => {
    const floatArray = new Float32Array(arr);
    const float32Buffer = Buffer.from(floatArray.buffer);
    return float32Buffer;
}
const queryProductDescriptionEmbeddingsByKNN = async (_searchTxt, _resultCount) => {

    //A KNN query will give us the top n documents that best match the query vector.

    /*  sample raw query

        FT.SEARCH idx:products
        "*=>[KNN 5 @productDescriptionEmbeddings $searchBlob AS score]" 
        RETURN 4 score brandName productDisplayName imageURL 
        SORTBY score 
        PARAMS 2 searchBlob "6\xf7\..." 
        DIALECT 2 

    */
    //https://redis.io/docs/interact/search-and-query/query/


    console.log(`queryProductDescriptionEmbeddingsByKNN started`);
    let results = {};
    if (_searchTxt) {

        _resultCount = _resultCount ?? 5;

        const nodeRedisClient = getNodeRedisClient();
        const searchTxtVectorArr = await generateSentenceEmbeddings(_searchTxt);

        const searchQuery =
            `*=>[KNN ${_resultCount} @productDescriptionEmbeddings $searchBlob AS score]`;

        //console.log(getVectorForRedisInsight(searchTxtVectorArr));
        results = await nodeRedisClient.ft.search(PRODUCTS_INDEX_KEY, searchQuery, {
            PARAMS: {
                "searchBlob": float32Buffer(searchTxtVectorArr)
            },
            RETURN: ["score", "brandName", "productDisplayName", "imageURL"],
            SORTBY: {
                BY: "score",
                // DIRECTION: "DESC"
            },
            DIALECT: 2,
        });
    }
    else {
        throw "Search text cannot be empty"
    }

    return results;
}

export {
    queryProductDescriptionEmbeddingsByKNN
}