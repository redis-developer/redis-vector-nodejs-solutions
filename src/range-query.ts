import { getNodeRedisClient } from './utils/redis/redis-wrapper.js';
import { generateSentenceEmbeddings } from "./text-vector-gen.js";
import { PRODUCTS_INDEX_KEY } from "./data.js";
import { float32Buffer, getVectorForRedisInsight } from "./misc.js";

const queryProductDescriptionEmbeddingsByRange = async (_searchTxt, _range) => {
    /*  sample raw query
   
       FT.SEARCH idx:products
       "@productDescriptionEmbeddings:[VECTOR_RANGE $searchRange $searchBlob]=>{$YIELD_DISTANCE_AS: score}"
       RETURN 4 score brandName productDisplayName imageURL 
       SORTBY score 
       PARAMS 4 searchRange 0.685 searchBlob "A=\xe1\xbb\x8a\xad\x...."
       DIALECT 2
       */

    console.log(`queryProductDescriptionEmbeddingsByRange started`);
    let results = {};
    if (_searchTxt) {

        _range = _range ?? 1.0;

        const nodeRedisClient = getNodeRedisClient();

        const searchTxtVectorArr = await generateSentenceEmbeddings(_searchTxt);

        const searchQuery =
            "@productDescriptionEmbeddings:[VECTOR_RANGE $searchRange $searchBlob]=>{$YIELD_DISTANCE_AS: score}";

        results = await nodeRedisClient.ft.search(PRODUCTS_INDEX_KEY, searchQuery, {
            PARAMS: {
                "searchBlob": float32Buffer(searchTxtVectorArr),
                "searchRange": _range
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
    queryProductDescriptionEmbeddingsByRange
}