import {
    Metadata,
    ServerInterceptingCall,
    ServerInterceptingCallInterface,
    ServerListener,
    ServerListenerBuilder,
    status
} from "@grpc/grpc-js";
import { ServerMethodDefinition } from "@grpc/grpc-js/build/src/make-client";

import { GetSecret, HMAC } from "../lib/hmac"; // Check if the path is correct
import { initLogger } from "../lib/logger";

const log = initLogger();

/**
 * Interface defining the structure of a server interceptor.
 */
export interface ServerInterceptor {
    /**
     * Function to intercept unary server calls.
     * @param methodDescriptor - The method descriptor of the unary server call.
     * @param call - The server intercepting call interface.
     * @returns The intercepted server call.
     */
    ServerInterceptor: (
        methodDescriptor: ServerMethodDefinition<any, any>,
        call: ServerInterceptingCallInterface
    ) => ServerInterceptingCall;

    /**
     * Function to add a unary interceptor to a method.
     * @returns A function that can be used to wrap a unary grpc method with the interceptor.
     */
    WithInterceptor: () => (
        methodDescriptor: ServerMethodDefinition<any, any>,
        call: ServerInterceptingCallInterface
    ) => ServerInterceptingCall;
}

/**
 * Implementation of the ServerInterceptor interface.
 */
class ServerInterceptorImpl implements ServerInterceptor {
    auth: (message: string, keyId: string, signature: string) => Error | undefined;
    hmac: HMAC;

    constructor(getSecret: GetSecret) {
        this.hmac = new HMAC();
        this.auth = this.hmac.verifySignature(getSecret);
    }

    /**
     * Intercepts unary server calls.
     * @param methodDescriptor - The method descriptor of the unary server call.
     * @param call - The server intercepting call interface.
     * @returns The intercepted server call.
     */
    ServerInterceptor(
        methodDescriptor: ServerMethodDefinition<any, any>,
        call: ServerInterceptingCallInterface
    ): ServerInterceptingCall {
        let savedMetadata: Metadata;
        return new ServerInterceptingCall(call, {
            start: next => {
                const authListener: ServerListener = new ServerListenerBuilder()
                    .withOnReceiveMetadata((metadata, mdNext) => {
                        if (!metadata.get("x-hmac-key-id")) {
                            log.error("No HMAC key ID provided");
                            call.sendStatus({
                                code: status.UNAUTHENTICATED,
                                details: "No HMAC key ID provided"
                            });
                        } else if (!metadata.get("x-hmac-signature")) {
                            log.error("No HMAC signature provided");
                            call.sendStatus({
                                code: status.UNAUTHENTICATED,
                                details: "No HMAC signature provided"
                            });
                        } else {
                            savedMetadata = metadata;
                            mdNext(metadata);
                        }
                    })
                    .withOnReceiveMessage((message, msgNext) => {
                        typeof message === "string"
                            ? log.debug(`Received message: ${message}`)
                            : message instanceof Buffer
                              ? log.debug(`Received message: ${message.toString()}`)
                              : typeof message === "object"
                                ? log.debug(`Received message: ${JSON.stringify(message)}`)
                                : typeof message === "number"
                                  ? log.debug(`Received message: ${message}`)
                                  : null;
                        const [msg, encodeErr] = this.hmac.buildMessage(message, methodDescriptor.path);

                        if (encodeErr) {
                            log.error(`Failed to encode request:  ${encodeErr}`);
                            call.sendStatus({
                                code: status.UNAUTHENTICATED,
                                details: encodeErr.message
                            });
                        }

                        const err = this.auth(
                            msg,
                            savedMetadata.get("x-hmac-key-id").toString(),
                            savedMetadata.get("x-hmac-signature").toString()
                        );

                        if (err) {
                            log.error(
                                `Authentication failed on unary method: ${methodDescriptor.path} with error ${err.name}`
                            );
                            call.sendStatus({
                                code: status.UNAUTHENTICATED,
                                details: err.message
                            });
                        }
                        msgNext(message);
                    })
                    .withOnReceiveHalfClose(halfClose => {
                        halfClose();
                    })
                    .withOnCancel(() => {})
                    .build();

                next(authListener);
            },
            sendMessage: (message, next) => {
                typeof message === "string"
                    ? log.debug(`Server Sending message: ${message}`)
                    : message instanceof Buffer
                      ? log.debug(`Server Sending message: ${message.toString()}`)
                      : typeof message === "object"
                        ? log.debug(`Server Sending message: ${JSON.stringify(message)}`)
                        : typeof message === "number"
                          ? log.debug(`Server Sending message: ${message}`)
                          : null;
                next(message);
            }
        });
    }

    /**
     * Adds a unary interceptor to a method.
     * @returns A function that can be used to wrap a unary grpc method with the interceptor.
     */
    WithInterceptor(): (
        methodDescriptor: ServerMethodDefinition<any, any>,
        call: ServerInterceptingCallInterface
    ) => ServerInterceptingCall {
        return (methodDescriptor: ServerMethodDefinition<any, any>, call: ServerInterceptingCallInterface) => {
            return this.ServerInterceptor(methodDescriptor, call);
        };
    }
}

/**
 * Creates a new server interceptor.
 * @param getSecret - The callback to get the secret.
 * @returns A promise resolving to the new server interceptor.
 */
export const NewServerInterceptor = (getSecret: GetSecret): ServerInterceptor => {
    return new ServerInterceptorImpl(getSecret);
};
