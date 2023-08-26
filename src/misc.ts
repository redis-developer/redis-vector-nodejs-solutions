const float32Buffer = (arr) => {
    const floatArray = new Float32Array(arr);
    const float32Buffer = Buffer.from(floatArray.buffer);
    return float32Buffer;
}

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

export {
    float32Buffer,
    getVectorForRedisInsight
}