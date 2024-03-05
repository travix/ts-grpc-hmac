// index.test.ts
import { describe, expect, it } from "vitest";

import { HMAC } from "../../index";

describe("Testing buildMessage function in HMAC module", () => {
    it.concurrent("buildMessage: non-empty request", () => {
        // Arrange
        const message = {
            name: "test",
            email: "test@example.com"
        };
        const path = "/example.UserService/GetUser";
        const expected = `request=${JSON.stringify(message)};method=${path}`;

        // Act
        const hmac = new HMAC();
        const [result, err] = hmac.buildMessage(message, path);

        expect(err).toBeUndefined();
        expect(result).toEqual(expected);
    });

    it.concurrent("buildMessage: no request", () => {
        // Arrange
        const method = "method";
        const expected = `method=${method}`;

        // Act
        const hmac = new HMAC();
        const [result, err] = hmac.buildMessage(null, method);

        // Assert
        expect(err).toBeUndefined();
        expect(result).toBe(expected);
    });

    it.concurrent("buildMessage: empty request", () => {
        // Arrange
        const method = "method";
        const expected = `method=${method}`;

        // Act
        const hmac = new HMAC();
        const [result, err] = hmac.buildMessage({}, method);

        expect(err).toBeUndefined();
        expect(result).toBe(expected);
    });
});
