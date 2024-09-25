import { BaseRouteConfig } from "./Base.Routes";
import express from "express";

export class TestRoute extends BaseRouteConfig {
	constructor(app: express.Application) {
		super(app, "/test");
	}

	configureRoutes(): express.Application {
		this.app.route("/test").get(async (request: express.Request, response: express.Response) => {
			response.status(200).send("Hello World!");
		});

		return this.app;
	}
}
