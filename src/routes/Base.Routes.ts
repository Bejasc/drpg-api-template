import express from "express";
export abstract class BaseRouteConfig {
	app: express.Application;
	name: string;
	authRequired: boolean;

	constructor(app: express.Application, name: string, authRequired = false) {
		this.app = app;
		this.name = name;
		this.authRequired = authRequired;
		this.configureRoutes();
	}
	getName() {
		return this.name;
	}

	abstract configureRoutes(): express.Application;
}
