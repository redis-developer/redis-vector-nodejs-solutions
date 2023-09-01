# Getting Started with Vector Search Using Redis in NodeJS

Code base for [tutorial](https://developer.redis.com/howtos/solutions/vector/getting-started-vector)

## Project setup

Add .env file at project root with `REDIS_URI` connection string

```.env
REDIS_URI="redis://localhost:6379"
```

### Install packages

```sh
npm install
```

### Start app

```sh
npm start
```

### Testing vector search

`src/index.ts` file has `testVectorQueryByKNNandRangeForText()` method where vector search can be tested with different search term.
