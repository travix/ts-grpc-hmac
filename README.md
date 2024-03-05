# :closed_lock_with_key: grpc-hmac-interceptor

This TypeScript library provides an HMAC authentication interceptor for gRPC, simplifying the process of setting up HMAC authentication for both server and client. It utilizes grpc-js, the official gRPC library for Node.js, employing interceptors to seamlessly integrate HMAC authentication into the gRPC server and client.

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

Add the HMAC client interceptor to the gRPC client.
```typescript
    // keyId and secretKey for HMAC authentication
    const target = "localhost:50051";
    const interceptor = NewClientInterceptor(keyId, secretKey);
    
    // create gRPC client
    const client: ServiceClient = new construct(target, credentials.createInsecure(), {
    interceptors: [interceptor.WithInterceptor()]
});
```
---
## ✏️ [Example]

### Requirements

```shell
# Build the ts-grpc-hmac library
npm run all

# Package the ts-grpc-hmac library
npm pack

# Go to the example directory
pushd example

# Install the required packages
npm install
# Generate the gRPC code
npm run generate 

# Run the example
./run.sh
```
[![asciicast](https://asciinema.org/a/59n7aYYFa7LJML5KJ7kQVtbIp.svg)](https://asciinema.org/a/59n7aYYFa7LJML5KJ7kQVtbIp)

## :key: HMAC Authentication

Steps for generating the HMAC:

1. **Encode Request Payload**: check the request payload if not empty, encode the request payload using the gob encoder. This encoding method serializes Go data structures into a binary format. If the payload is not empty, encode the request payload using the gob encoder. This encoding method serializes data structures into a binary format.

2. **Concatenate with Method Name**: Concatenate the encoded request payload (or just the full method name if the payload is empty) with the full method name of the gRPC service. Use a semicolon (;) as the separator between the payload and the method name.

3. **Encrypt with Secret**: Encrypt the concatenated message using the SHA512_256 algorithm and a secret key. HMAC typically involves using a cryptographic hash function (in this case, SHA512_256) along with a secret key to generate a fixed-size hash value.

4. **Base64 Encode**: Base64 encode the encrypted message to ensure that it is transmitted safely.


Steps for verifying the HMAC:

1. **Client Interceptor**: The client interceptor will add the `x-hmac-key-id` and `x-hmac-signature` to the outgoing request metadata.
2. **Server Interceptor**: The server interceptor will extract the `x-hmac-key-id` and `x-hmac-signature` from the incoming request metadata, and then verify the HMAC signature using the `x-hmac-key-id` and the secret key associated with the key id.
3. if signature is **valid**, the request will be processed, **otherwise** `UNAUTHENTICATED` error will be returned.

## CONTRIBUTING

We welcome contributions to ts-grpc-hmac! Please see the [CONTRIBUTING.md](./CONTRIBUTING.md) file for more information.

[Example]: ./example/README.md

