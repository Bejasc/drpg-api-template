import express from "express";
import * as expressWinston from "express-winston";
import * as winston from "winston";
import { format } from "winston";

export function setupLogger(app: express.Application) {
	// here we are preparing the expressWinston logging middleware configuration,
	// which will automatically log all HTTP requests handled by Express.js

	const loggerOptions: expressWinston.LoggerOptions = {
		transports: [new winston.transports.Console()],
		format: combine(format.json(), format.prettyPrint(), format.colorize({ all: true }), splat(), timestamp(), myFormat),
		// format: winston.format.combine(winston.format.json(), winston.format.prettyPrint(), winston.format.colorize({ all: true })),
	};

	if (!process.env.DEBUG) {
		loggerOptions.meta = false; // when not debugging, log requests as one-liners
	}

	// initialize the logger with the above configuration
	app.use(expressWinston.logger(loggerOptions));
}

export const runningMessage = `Server running at http://localhost:${process.env.PORT}`;

const { combine, splat, timestamp, printf } = format;

const myFormat = printf(({ level, message, timestamp, ...metadata }) => {
	let msg = `${timestamp} [${level}] : ${message} `;
	if (metadata) {
		msg += JSON.stringify(metadata);
	}
	msg = msg.replace(" {}", "");
	msg = msg.replace(' {"meta":{}}', "");
	return msg;
});

export const logger = winston.createLogger({
	level: "debug",
	format: combine(format.colorize(), splat(), timestamp(), myFormat),
	transports: [
		new winston.transports.Console(),
		// new winston.transports.File({ filename: "logfile.log" }) //TODO Add this as to be configured on/off with environment variable
	],
});

export function logToDiscord(message: string, title: string) {
	logger.warn("Discord logging is not enabled until webhooks are specified");
	logger.debug(`${title} :: ${message}`);
}
