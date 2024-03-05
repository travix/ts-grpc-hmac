import { sendUnaryData, Server, ServerCredentials, ServerUnaryCall, ServerWritableStream } from "@grpc/grpc-js";
import { GetUserRequest } from "../../generated/example/GetUserRequest";
import { User } from "../../generated/example/User";
import { NewServerInterceptor, initLogger } from "grpc-hmac-interceptor";
import { dirname } from "path";
import { fileURLToPath } from "url";
import path from "path";
import { getService } from "../common";

const { HMAC_KEY_ID: keyId = "key", HMAC_SECRET: secretKey = "secret" } = process.env;

const log = initLogger();
/**
 * Implementation of the example service
 */

export const serviceImpl = {
    getUser: (_call: ServerUnaryCall<GetUserRequest, User>, callback: sendUnaryData<any>) => {
        const user = {
            name: "Unknown",
            email: "unknown@example.com"
        };

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

/**
 * getSecret function to fetch the secret from secret manager or any other source
 */
const getSecret = (key: string = keyId): string => {
    // Any implementation to fetch the secret from a database or any other source
    const secrets = [
        {
            key: keyId,
            secret: secretKey
        }
    ];

    const secret = secrets.find(secret => key === secret.key);
    if (secret) {
        return secret.secret;
    } else {
        return "";
    }
};

const main = () => {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const protoPath = path.join(__dirname, "../../", "example.proto");
    const [userService, _constructor] = getService({
        path: protoPath,
        package: "example",
        service: "UserService"
    });

    const target = "localhost:50051";

    const interceptor = NewServerInterceptor(getSecret);

    let server: Server = new Server({ interceptors: [interceptor.WithInterceptor()] });

    server.addService(userService, serviceImpl);
    server.bindAsync(target, ServerCredentials.createInsecure(), (error, port) => {
        if (error) {
            log.error("Failed to start server", error);
        }
        log.info(`Server started on port ${port}`);
    });
};

main();
