import { credentials, ServiceError } from "@grpc/grpc-js";
import { User } from "../../generated/example/User";
import { NewClientInterceptor, initLogger } from "grpc-hmac-interceptor";
import { GetUserRequest } from "../../generated/example/GetUserRequest";
import { ServiceClient } from "@grpc/grpc-js/build/src/make-client";
import { getService } from "../common";
import { fileURLToPath } from "url";
import { dirname } from "path";
import * as path from "path";

const log = initLogger();
const main = () => {
    const { HMAC_KEY_ID: keyId = "key", HMAC_SECRET: secretKey = "secret" } = process.env;
    const dir = dirname(fileURLToPath(import.meta.url));
    const protoPath = path.join(dir, "../../", "example.proto");
    console.log(protoPath);
    const [_userService, construct] = getService({
        path: protoPath,
        package: "example",
        service: "UserService"
    });
    const target = "localhost:50051";
    const interceptor = NewClientInterceptor(keyId, secretKey);

    // @ts-ignore
    const client: ServiceClient = new construct(target, credentials.createInsecure(), {
        interceptors: [interceptor.WithInterceptor()]
    });
    const req = { name: "unknown" } as GetUserRequest;
    req.name = "Unknown";
    client.getUser(req, (err: ServiceError, response: User) => {
        if (err) {
            log.error(`Error from Server: ${err.message}`);
            return;
        }
        log.info(`Response from Server: ${JSON.stringify(response)}`);
    });
};

main();
