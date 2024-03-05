import { createLogger, format, transports, Logger } from "winston";
import chalk, { ChalkInstance } from "chalk";

// Define custom log levels
type LogLevel = "INF" | "WRN" | "ERR" | "DEBUG";

// Define log format function
type ColorizeText = (text: string, color: ChalkInstance) => string;
const customSimpleFormat = (colorizeText: ColorizeText) =>
    format.printf(({ level, label, timestamp, message }) => {
        const formattedLevel = formatLevel(level);
        return `${colorizeText(`[${label}]`, chalk.green)} ${timestamp} ${colorizeText(formattedLevel, getLevelColor(level))} ${message}`;
    });

// Helper function to format log levels
const formatLevel = (level: string): LogLevel => {
    switch (level) {
        case "info":
            return "INF";
        case "warn":
            return "WRN";
        case "error":
            return "ERR";
        case "debug":
            return "DEBUG";
        default:
            return level.toUpperCase() as LogLevel;
    }
};

// Helper function to get color based on log level
const getLevelColor = (level: string): ChalkInstance => {
    switch (level) {
        case "info":
            return chalk.green;
        case "warn":
            return chalk.yellow;
        case "error":
            return chalk.red;
        case "debug":
            return chalk.blue;
        default:
            return chalk.white;
    }
};

// Initialize logger function
export const initLogger = (): Logger => {
    const colorizeText: ColorizeText = (text: string, color: ChalkInstance) => color(text); // Default color for level
    return createLogger({
        format: format.combine(
            // format.errors({ stack: true }),
            format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
            format.label({ label: "ts-grpc-hmac" }),
            customSimpleFormat(colorizeText)
        ),
        transports: [new transports.Console()]
    });
};
