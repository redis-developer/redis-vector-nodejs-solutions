import { getNodeRedisClient } from './utils/redis/redis-wrapper.js';
import { generateSentenceEmbeddings } from "./text-vector-gen.js";
import { generateImageEmbeddings } from "./image-vector-gen.js";
import { PRODUCTS_INDEX_KEY } from "./data.js";
import { float32Buffer, getVectorForRedisInsight } from "./misc.js";


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

const queryProductImageEmbeddingsByKNN = async (_imageURL, _resultCount) => {

    //A KNN query will give us the top n documents that best match the query vector.

    /*  sample raw query

        FT.SEARCH idx:products
        "*=>[KNN 5 @productImageEmbeddings $searchBlob AS score]" 
        RETURN 4 score brandName productDisplayName imageURL 
        SORTBY score 
        PARAMS 2 searchBlob "6\xf7\..." 
        DIALECT 2 

    */
    //https://redis.io/docs/interact/search-and-query/query/


    console.log(`queryProductImageEmbeddingsByKNN started`);
    let results = {};
    if (_imageURL) {

        _resultCount = _resultCount ?? 5;

        const nodeRedisClient = getNodeRedisClient();
        const searchTxtVectorArr = await generateImageEmbeddings(_imageURL);

        const searchQuery =
            `*=>[KNN ${_resultCount} @productImageEmbeddings $searchBlob AS score]`;

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
        throw "imageURL cannot be empty"
    }

    return results;
}

export {
    queryProductDescriptionEmbeddingsByKNN,
    queryProductImageEmbeddingsByKNN
}