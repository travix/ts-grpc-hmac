import {
    InterceptingCall,
    InterceptingListener,
    InterceptorOptions,
    Metadata,
    NextCall,
    RequesterBuilder
} from "@grpc/grpc-js";
import { FullListener } from "@grpc/grpc-js/build/src/call-interface";
import { Logger } from "winston";

import { HMAC } from "../lib/hmac";
import { initLogger } from "../lib/logger";

const log: Logger = initLogger();

/**
 * Interface for a client-side interceptor.
 */
export interface ClientInterceptor {
    /**
     * Function that creates a unary client interceptor.
     * @param options - Interceptor options.
     * @param next - Next call in the interceptor chain.
     * @returns InterceptingCall
     */
    Interceptor: (options: InterceptorOptions, next: NextCall) => InterceptingCall;

    /**
     * Function that returns a unary client interceptor.
     * @returns Function that creates a unary client interceptor.
     */
    WithInterceptor: () => (options: InterceptorOptions, nextCall: NextCall) => InterceptingCall;
}

class ClientInterceptorImpl implements ClientInterceptor {
    private readonly hmacKeyId: string;
    private readonly hmacSecret: string;
    private readonly protoStaticGeneration?: boolean;
    private hmac: HMAC;

    /**
     * Create a new instance of the ClientInterceptor.
     * @param hmacKeyId - HMAC key ID.
     * @param hmacSecret - HMAC secret key.
     * @param protoStaticGeneration - if true, the user generate proto using proto-loader, if false, the user generate proto using protoc, default is false.
     */
    constructor(hmacKeyId: string, hmacSecret: string, protoStaticGeneration?: boolean) {
        this.hmacKeyId = hmacKeyId;
        this.hmacSecret = hmacSecret;
        this.protoStaticGeneration = protoStaticGeneration;
        this.hmac = new HMAC();
    }

    /**
     * Function that creates a unary client interceptor.
     * @param options - Interceptor options.
     * @param next - Next call in the interceptor chain.
     * @returns InterceptingCall
     */
    Interceptor(options: InterceptorOptions, next: NextCall): InterceptingCall {
        let savedMetadata: Metadata;
        let savedListener: InterceptingListener;
        let startNext: (metadata: Metadata, listener: InterceptingListener | Partial<FullListener>) => void;

        // Create a Requester using RequesterBuilder
        const requester = new RequesterBuilder()
            .withStart((metadata, listener, next) => {
                savedMetadata = metadata;
                savedListener = listener;
                startNext = next;
            })
            .withSendMessage((message, next) => {
                let messageObject = message;
                if (this.protoStaticGeneration) {
                    messageObject = message.toObject();
                }
                log.info(`Sending message: ${JSON.stringify(messageObject)}`);
                // Encode the message and generate the signature
                const [msg, encodeErr] = this.hmac.buildMessage(messageObject, options.method_definition.path);
                if (encodeErr) {
                    log.error(`Failed to encode request: ${encodeErr}`);
                    return;
                }

                const [signature, signErr] = this.hmac.generateSignature(this.hmacSecret, msg);
                if (signErr) {
                    log.error(`Failed to generate signature: ${signErr}`);
                    return;
                }

                // Set HMAC-related metadata
                savedMetadata = savedMetadata ?? new Metadata();
                savedMetadata.set("x-hmac-key-id", this.hmacKeyId);
                savedMetadata.set("x-hmac-signature", signature);

                // Call the next interceptor
                startNext(savedMetadata, savedListener);
                next(message);
            })
            .withHalfClose(next => {
                next();
            })
            .withCancel(message => {
                log.error(`Cancelled message: ${message}`);
            })
            .build();

        // Return the InterceptingCall with the next call and the requester
        return new InterceptingCall(next(options), requester);
    }

    /**
     * Function that returns a unary client interceptor.
     * @returns Function that creates a unary client interceptor.
     */
    WithInterceptor(): (options: InterceptorOptions, nextCall: NextCall) => InterceptingCall {
        return (options: InterceptorOptions, next: NextCall) => {
            return this.Interceptor(options, next);
        };
    }
}

/**
 * Factory function to create a new client interceptor.
 * @param hmacKeyId - HMAC key ID.
 * @param hmacSecret - HMAC secret key.
 * @param protoStaticGeneration - if true, the user generate proto using proto-loader, if false, the user generate proto using protoc, default is false.
 * @returns ClientInterceptor
 */
export const NewClientInterceptor = (
    hmacKeyId: string,
    hmacSecret: string,
    protoStaticGeneration?: boolean
): ClientInterceptor => {
    return new ClientInterceptorImpl(hmacKeyId, hmacSecret, protoStaticGeneration);
};
