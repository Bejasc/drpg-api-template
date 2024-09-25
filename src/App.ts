// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();

import * as fs from 'fs';
import * as http from "http";
import * as path from 'path';

import { logger, runningMessage, setupLogger } from "./Logging";

import { BaseRouteConfig } from "./routes/Base.Routes";
import { DB } from "./Database";
import { TestRoute } from "./routes/TestRoute.Routes";
import cors from "cors";
import express from "express";

const app: express.Application = express();
const server: http.Server = http.createServer(app);

app.use(express.json());
app.use(cors());

setupLogger(app);

function authMiddleware(req: express.Request, res: express.Response, next) {
	const route = routes.find((r) => req.path.startsWith(r.name));
	if (!route.authRequired) next();
	else {
		const incomingKey = req.headers["api-key"] ?? req.query.apikey;
		const requiredKey = process.env.API_KEY;

		if (incomingKey === requiredKey) {
			logger.debug(`${route.name}: Request authenticated sucessfully`);
			next();
		} else {
			logger.warn(`${route.name}: Unauthenticated request`);
			res.status(401).send("Unauthorized");
		}
	}
}
app.use(authMiddleware);

const routes:BaseRouteConfig[] = [];

//Dynamically add routes
const routesPath = path.join(__dirname, 'routes');
fs.readdirSync(routesPath).forEach(file => {
  if (file.endsWith('.Routes.ts') || file.endsWith('.Routes.js')) {
    const routeModule = require(path.join(routesPath, file));
    const RouteClass = Object.values(routeModule).find(
      (exportedItem): exportedItem is new (app: express.Application) => BaseRouteConfig =>
        typeof exportedItem === 'function' &&
        exportedItem.prototype instanceof BaseRouteConfig
    );
    if (RouteClass) {
      routes.push(new RouteClass(app));
    }
  }
});

app.get("/", (req: express.Request, res: express.Response) => {
	res.status(200).send(runningMessage);
});

server.listen(process.env.PORT, async () => {
	logger.info("Server starting...");

	await DB.init();

	routes.forEach((route: BaseRouteConfig) => {
		logger.debug(`Routes configured for ${route.getName()}`);
	});

	logger.info(runningMessage);
});
