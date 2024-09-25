/* eslint-disable @typescript-eslint/no-explicit-any */

import { logger } from "./Logging";
import mongoose from "mongoose";

async function makeNewConnection(dbname): Promise<mongoose.Connection> {
	const mongoOptions = {
		uri: process.env.MONGO_URI,
		password: process.env.MONGO_PASSWORD,
		dbname,
	};
	const uri = buildMongoUri(mongoOptions);

	const db = mongoose.createConnection(uri, { maxPoolSize: 3 });

	db.on("error", function (error) {
		logger.error(`MongoDB :: connection ${this.name} ${JSON.stringify(error)}`);
	});

	db.on("connected", function () {
		logger.info(`MongoDB :: connected ${this.name}`);
	});

	// db.on("disconnected", function () {
	// 	logger.warn(`MongoDB :: disconnected ${this.name}`);
	// });
	return db;
}

function buildMongoUri(options): string {
	let uri = options.uri;

	if (!uri) {
		logger.error("ERR: Mongo URI has not been provided!");
		return;
	}

	uri = uri.replace("<password>", options.password);

	uri = `${uri}/${options.dbname}`;

	return uri;
}


export class DB {
	private static conn: mongoose.Connection;

	public static async init() {
		this.conn = await makeNewConnection(process.env.MONGO_DBNAME);
	}

	// public static get Location(): mongoose.Model<any, any, any, any> {
	// 	return this.conn.model("location", LocationSchemaV2);
	// }

	// public static get Item(): mongoose.Model<any, any, any, any> {
	// 	return this.conn.model("item", ItemSchemaV2);
	// }
}

