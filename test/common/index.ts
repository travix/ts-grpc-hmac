import {
    ChannelOptions,
    credentials,
    GrpcObject,
    loadPackageDefinition,
    sendUnaryData,
    Server,
    ServerCredentials,
    ServerOptions,
    ServerUnaryCall,
    ServerWritableStream,
    ServiceClientConstructor,
    ServiceError
} from "@grpc/grpc-js";
import { ConnectivityState } from "@grpc/grpc-js/build/src/connectivity-state";
import { ServiceClient } from "@grpc/grpc-js/build/src/make-client";
import * as protoLoader from "@grpc/proto-loader";
import * as path from "path";

import { NewClientInterceptor } from "../../src/client";
import { NewServerInterceptor } from "../../src/server";
import { GetUserRequest } from "./generated/example/GetUserRequest";
import { User } from "./generated/example/User";

const protoLoaderOptions = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
    keepalive: {
        keepaliveTimeMs: 5000,
        keepaliveTimeoutMs: 5000
    }
};

const protoFile = path.join(__dirname, "/../", "fixtures", "example.proto");

// Load the proto files and return the gRPC object
export const loadProtoFile = (protoFiles: string): GrpcObject => {
    const packageDefinition = protoLoader.loadSync(protoFiles, protoLoaderOptions);
    return loadPackageDefinition(packageDefinition);
};

const userService = loadProtoFile(protoFile).example["UserService"] as ServiceClientConstructor;

const userServiceImpl = {
    getUser: (_call: ServerUnaryCall<GetUserRequest, User>, callback: sendUnaryData<any>) => {
        // Extract the request object from the gRPC call
        // const request: GetUserRequest = call.request;
        const user: User = {
            name: "Unknown",
            email: "unknown@example.com"
        } as User;
        callback(null, user);
    },
    listUsers: (call: ServerWritableStream<GetUserRequest, User>) => {
        const users: User[] = [
            {
                name: "Unknown",
                email: "unknown@example.com"
            },
            {
                name: "Known",
                email: "known@example.com"
            }
        ];
        users.forEach(user => {
            call.write(user);
        });
        call.end();
    }
};

// Create a new instance of the gRPC server
export class TestServer {
    private readonly server: Server;
    public port: string | null = null;

    constructor(options?: ServerOptions) {
        this.server = new Server(options);
        this.server.addService(userService.service, userServiceImpl);
    }

    // start the server
    async start(): Promise<void | Error> {
        const credentials = ServerCredentials.createInsecure();
        try {
            const actualPort = await new Promise((resolve, reject) => {
                this.server.bindAsync("localhost:0", credentials, (err, actualPort) => {
                    if (err) {
                        console.error("Error starting server", err);
                        reject(err);
                    }
                    this.port = actualPort.toString();
                    resolve(actualPort);
                });
            });

            this.port = actualPort.toString();
        } catch (err) {
            console.error("Error Starting Test server", err);
            return err;
        }
    }

    // shutdown the server
    async shutdown(): Promise<Error | undefined> {
        return new Promise<Error | undefined>((resolve, reject) => {
            this.server.tryShutdown((err?: Error) => {
                if (err) {
                    console.error("Error shutting down server", err);
                    reject(err);
                } else {
                    resolve(undefined);
                }
            });
        });
    }

    static async startServerWithHMACInterceptor(hmacKeyId: string, hmacSecret: string): Promise<TestServer | Error> {
        const serverInterceptor = NewServerInterceptor((key: string = hmacKeyId): string => {
            const secrets = [
                {
                    key: hmacKeyId,
                    secret: hmacSecret
                }
            ];

            const secret = secrets.find(secret => secret.key === key);

            if (secret) {
                return secret.secret;
            } else {
                return "";
            }
        });
        const server = new TestServer({ interceptors: [serverInterceptor.WithInterceptor()] });
        const err = await server.start();
        if (err) {
            console.error("Error starting server", err);
            return err;
        }
        return server;
    }
}

// Create a new instance of the gRPC client
export class TestClient {
    private client: ServiceClient;
    constructor(port: string, options?: ChannelOptions) {
        const creds = credentials.createInsecure();
        this.client = new userService(`localhost:${port}`, creds, options);
    }

    static createWithHMACInterceptor(server: TestServer, hmacKeyId: string, hmacSecret: string): TestClient {
        const clientInterceptor = NewClientInterceptor(hmacKeyId, hmacSecret);
        return new TestClient(server.port, { interceptors: [clientInterceptor.WithInterceptor()] });
    }

    isChannelReady(): boolean {
        return this.client.getChannel().getConnectivityState(true) === ConnectivityState.READY;
    }

    sendRequest(request: GetUserRequest, callback: (error: ServiceError, response: User) => void): void {
        this.client.getUser(request, callback);
    }

    close(): void {
        this.client.close();
    }
}
