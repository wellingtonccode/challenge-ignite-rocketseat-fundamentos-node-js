import http from "node:http";
import { routes } from "./routes.js";
import { json } from './middlewares/json.js'
import { extractQueryParams } from "./utils/extract-query-params.js";

const server = http.createServer(async (req, res) => {
    const {method, url} = req;

    // Ajusto o req.body e o req.Header.
    await json(req, res);

    console.log(`
    --------------------------------------------------------------------------------
    Method: ${method},
    URL: ${url}
    `);

    const route = routes.find(route => {
        return route.method === method && route.path.test(url);
    });

    if (route){
        const routeParams = req.url.match(route.path);

        const {query, ... params} = routeParams.groups;

        req.params = params;
        req.query = query ? extractQueryParams(query) : {};

        console.log(`
        --------------------------------------------------------------------------------
        Params: ${req.params},
        Query: ${req.query}
        `);

        return route.handler(req, res);
    }

    return res.writeHead(404).end();
});

server.listen(8081);