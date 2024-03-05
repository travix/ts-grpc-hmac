// clientInterceptor.test.ts
import { afterAll, describe, it, vi } from "vitest";

import { TestClient, TestServer } from "../common";
import { GetUserRequest } from "../common/generated/example/GetUserRequest";
import { User } from "../common/generated/example/User";

describe("Client Interceptor Tests", () => {
    // Mock HMAC key ID and secret for testing
    const { HMAC_KEY_ID: keyId = "key", HMAC_SECRET: secretKey = "secret" } = process.env;

    let client: TestClient;
    let server: TestServer;
    it("Test Unary Client Interceptor", async ({ expect }) => {
        const serverOrErr = await TestServer.startServerWithHMACInterceptor(keyId, secretKey);
        expect(serverOrErr).not.toBeInstanceOf(Error);
        server = serverOrErr as TestServer;
        client = TestClient.createWithHMACInterceptor(server, keyId, secretKey);
        await vi.waitUntil(() => client.isChannelReady(), {
            timeout: 1000,
            interval: 20
        });

        expect(client.isChannelReady()).toBeTruthy();
        const userRequest: GetUserRequest = { name: "Unknown" } as GetUserRequest;
        const expectedUser: User = {
            name: "Unknown",
            email: "unknown@example.com"
        };
        const result = await new Promise((resolve, reject) => {
            client.sendRequest(userRequest, (err, res): void => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });

        expect(result).toEqual(expectedUser);
    });

    afterAll(async () => {
        client.close();
        await server.shutdown();
    });
});
