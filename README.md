# :closed_lock_with_key: grpc-hmac-interceptor

This TypeScript library provides an HMAC authentication interceptor for gRPC, simplifying the process of setting up HMAC authentication for both server and client. It utilizes [grpc-js], the official gRPC library for Node.js, employing interceptors to seamlessly integrate HMAC authentication into the gRPC server and client.

## :rocket: Usage

### Installation

```shell
npm install --save-dev grpc-hmac-interceptor
```

### 1. Server

Add the HMAC server interceptor to the gRPC server.

```typescript
    // keyId for which secret_key is returned by hmac.GetSecret func type
    const getSecret: GetSecret = (keyId: string) => {
        // return secret_key for the keyId
        return secretKey;
    };

    // create HMAC server interceptor
    const interceptor = NewServerInterceptor(getSecret);
    let server: Server = new Server({ interceptors: [interceptor.WithInterceptor()] });
```

### 2. Client

Create the HMAC client interceptor using the provided function `NewClientInterceptor`. By default, the interceptor expects the proto to be loaded by `@grpc/proto-loader`, and the `@grpc/grpc-js` library can be used. If the proto is loaded by protoc, you need to pass `true` as the third argument in the interceptor function call.

#### Case 1: Proto Loaded by `@grpc/proto-loader`


```typescript
    // keyId and secretKey for HMAC authentication
    const target = "localhost:50051";
    const interceptor = NewClientInterceptor(keyId, secretKey);
    
    // create gRPC client
    const client: ServiceClient = new construct(target, credentials.createInsecure(), {
    interceptors: [interceptor.WithInterceptor()]
});
```
In this case, the proto is loaded by `@grpc/proto-loader`, and you can use the `@grpc/grpc-js` library for your gRPC client.

#### Case 2: Proto Loaded by `protoc` or `grpc-tools`

```typescript
    // keyId and secretKey for HMAC authentication
    const target = "localhost:50051";
    const interceptor = NewClientInterceptor(keyId, secretKey, true);
    
    // create gRPC client
    const client: ServiceClient = new construct(target, credentials.createInsecure(), {
    interceptors: [interceptor.WithInterceptor()]
});
```
In this case, the proto is loaded by `protoc` or `grpc-tools`, as the messaged wrapped with `jspb.Message`, so interceptor needs to handle the message accordingly.

---
## ✏️ [Example]

### :cook: Requirements

```shell
# go to example directory
pushd example

# install the dependencies
npm install

# Update the grpc-hmac-interceptor to the latest version
npm install grpc-hmac-interceptor@latest # <latest> is the latest version

# run the example # it will start server with HMAC interceptor and two clients with HMAC interceptor, one with valid HMAC and other with invalid HMAC signature
./run.sh
```

### :tv: Demo:
[![asciicast](https://asciinema.org/a/59n7aYYFa7LJML5KJ7kQVtbIp.svg)](https://asciinema.org/a/59n7aYYFa7LJML5KJ7kQVtbIp)

## :key: HMAC Authentication

Steps for generating the HMAC:

1. **Encode Request Payload**: stringify the request payload
2. **Concatenate with Method Name**: build a message by concatenation `request=<stringified request>;method=<method name>`, where `request` is the stringified request payload and `method` is the name of the method being called, e.g. `request={"name":"John"};method=/example.UserService/GetUser`. If the request payload is empty, the message will be just method name, e.g. `method=/example.UserService/GetUser`.
3. **Encrypt with Secret**: encrypt the concatenated message using the SHA512_256 algorithm and a secret key. HMAC typically involves using a cryptographic hash function (in this case, SHA512_256) along with a secret key to generate a fixed-size hash value.
4. **Base64 Encode**: encode the encrypted message to base64 to ensure that it is transmitted safely.


Steps for verifying the HMAC:

1. **Client Interceptor**: The client interceptor will add the `x-hmac-key-id` and `x-hmac-signature` to the outgoing request metadata.
2. **Server Interceptor**: The server interceptor will extract the `x-hmac-key-id` and `x-hmac-signature` from the incoming request metadata, and then verify the HMAC signature using the `x-hmac-key-id` and the secret key associated with the key id.
3. if signature is **valid**, the request will be processed, **otherwise** `UNAUTHENTICATED` error will be returned.

## :computer: CONTRIBUTING

We welcome contributions to ts-grpc-hmac! Please see the [CONTRIBUTING.md](./CONTRIBUTING.md) file for more information.

[Example]: ./example/README.md
[grpc-js]: https://github.com/grpc/grpc-node/tree/master/packages/grpc-js
