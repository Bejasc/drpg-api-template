// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();

import * as http from "http";

import { logger, runningMessage, setupLogger } from "./Logging";

import { BaseRouteConfig } from "./routes/Base.Routes";
import { DB } from "./Database";
import cors from "cors";
import express from "express";

const app: express.Application = express();
const server: http.Server = http.createServer(app);
const routes: BaseRouteConfig[] = [];

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
