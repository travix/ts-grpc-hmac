import { initLogger } from "../logger";
import { Buffer } from "buffer";
import { createHmac, timingSafeEqual } from "crypto";
import { ErrInternal, ErrInvalidHmacKeyID, ErrInvalidHmacSignature } from "./status";
import { isEmptyObject } from "../util";

const log = initLogger();

export type GetSecret = (keyId: string) => string;

/**
 * HMAC class for generating and verifying HMAC signatures.
 */
export class HMAC {
    constructor() {}
    /**
     * Builds a message string representation of the request and method.
     * @param req - The request object.
     * @param method - The method name.
     * @returns A tuple containing the message string from the request and method concatenation with semicolon and an optional error.
     */
    public buildMessage = (req: any, method: string): [string, Error?] => {
        const methodKey = "method=";
        const requestKey = "request=";

        // If no request is provided, use only the method name as the message
        if (!req) {
            console.warn("No request provided, using only method name as message");
            return [methodKey + method, undefined];
        }

        let requestString: string;

        // Convert the request object to a string representation
        if (typeof req === "string") {
            requestString = req;
        } else if (typeof req === "object") {
            const replacer = (key, value) => {
                if (typeof(value) === "string" && value === "") return undefined
                return value
            }
            requestString = isEmptyObject(req) ? "" : JSON.stringify(req, replacer, 0);
        } else {
            return ["", new Error("Invalid request type")];
        }

        // If the request string is empty, log a warning and use only the method name as the message
        if (requestString.length === 0) {
            console.warn("Empty request, using only method name as message");
            return [methodKey + method, undefined];
        }

        // Construct the message string with the request and method
        const message = `${requestKey}${requestString};${methodKey}${method}`;
        return [message, undefined];
    };

    /**
     * Generates an HMAC signature for the given message and secret key.
     * @param secretKey - The secret key used for generating the HMAC.
     * @param message - The message to generate the signature for.
     * @returns A tuple containing the HMAC signature and an optional error.
     */ public generateSignature = (secretKey: string, message: string): [string, Error | undefined] => {
        log.debug(`generating signature for message: ${message}`);
        const mac = createHmac("sha512-256", secretKey);
        mac.update(message);
        const digest = mac.digest("base64");
        log.debug(`signature generated: ${digest}`);
        return [digest, undefined];
    };

    /**
     * Verifies the HMAC signature against the provided message and key ID.
     * @param getSecret - A function to retrieve the secret key based on the key ID.
     * @returns A function that takes the message, key ID, and signature, and returns a Promise resolving to an error or undefined.
     */
    public verifySignature =
        (getSecret: GetSecret) =>
        (message: string, keyId: string, signature: string): Error | undefined => {
            try {
                log.debug(`verifying signature for message: ${message}`);
                const secret = getSecret(keyId);
                log.debug("secret: ", secret);
                if (secret === undefined) {
                    log.error("error: invalid key id");
                    return new Error(`${ErrInvalidHmacKeyID.code}:  ${ErrInvalidHmacKeyID.details}`);
                }
                const [expectedSignature, err] = this.generateSignature(secret, message);
                if (err) {
                    log.error(`error: failed to generate signature: ${err}`);
                    return new Error(`${ErrInternal.code}: ${err.message}`);
                }

                if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
                    log.error("error: signature verification failed");
                    return new Error(`${ErrInvalidHmacSignature.code}: ${ErrInvalidHmacSignature.details}`);
                }

                return undefined; // No error, signature verification successful
            } catch (error) {
                log.error("error: unexpected error occurred during signature verification: ", error);
                return new Error(`${ErrInternal.code} :  ${error}`);
            }
        };
}

// Export status codes and details
export * from "./status";
