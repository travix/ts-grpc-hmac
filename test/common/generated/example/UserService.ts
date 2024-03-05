// Original file: test/fixtures/example.proto

import type * as grpc from "@grpc/grpc-js";
import type { MethodDefinition } from "@grpc/proto-loader";
import type {
    Empty as _google_protobuf_Empty,
    Empty__Output as _google_protobuf_Empty__Output
} from "../google/protobuf/Empty";
import type {
    GetUserRequest as _example_GetUserRequest,
    GetUserRequest__Output as _example_GetUserRequest__Output
} from "../example/GetUserRequest";
import type { User as _example_User, User__Output as _example_User__Output } from "../example/User";

/**
 * UserService is a service exposed by Grpc servers that provides user management
 */
export interface UserServiceClient extends grpc.Client {
    /**
     * Get a user by name
     */
    GetUser(
        argument: _example_GetUserRequest,
        metadata: grpc.Metadata,
        options: grpc.CallOptions,
        callback: grpc.requestCallback<_example_User__Output>
    ): grpc.ClientUnaryCall;
    GetUser(
        argument: _example_GetUserRequest,
        metadata: grpc.Metadata,
        callback: grpc.requestCallback<_example_User__Output>
    ): grpc.ClientUnaryCall;
    GetUser(
        argument: _example_GetUserRequest,
        options: grpc.CallOptions,
        callback: grpc.requestCallback<_example_User__Output>
    ): grpc.ClientUnaryCall;
    GetUser(
        argument: _example_GetUserRequest,
        callback: grpc.requestCallback<_example_User__Output>
    ): grpc.ClientUnaryCall;
    /**
     * Get a user by name
     */
    getUser(
        argument: _example_GetUserRequest,
        metadata: grpc.Metadata,
        options: grpc.CallOptions,
        callback: grpc.requestCallback<_example_User__Output>
    ): grpc.ClientUnaryCall;
    getUser(
        argument: _example_GetUserRequest,
        metadata: grpc.Metadata,
        callback: grpc.requestCallback<_example_User__Output>
    ): grpc.ClientUnaryCall;
    getUser(
        argument: _example_GetUserRequest,
        options: grpc.CallOptions,
        callback: grpc.requestCallback<_example_User__Output>
    ): grpc.ClientUnaryCall;
    getUser(
        argument: _example_GetUserRequest,
        callback: grpc.requestCallback<_example_User__Output>
    ): grpc.ClientUnaryCall;

    /**
     * List all users
     */
    ListUsers(
        argument: _google_protobuf_Empty,
        metadata: grpc.Metadata,
        options?: grpc.CallOptions
    ): grpc.ClientReadableStream<_example_User__Output>;
    ListUsers(
        argument: _google_protobuf_Empty,
        options?: grpc.CallOptions
    ): grpc.ClientReadableStream<_example_User__Output>;
    /**
     * List all users
     */
    listUsers(
        argument: _google_protobuf_Empty,
        metadata: grpc.Metadata,
        options?: grpc.CallOptions
    ): grpc.ClientReadableStream<_example_User__Output>;
    listUsers(
        argument: _google_protobuf_Empty,
        options?: grpc.CallOptions
    ): grpc.ClientReadableStream<_example_User__Output>;
}

/**
 * UserService is a service exposed by Grpc servers that provides user management
 */
export interface UserServiceHandlers extends grpc.UntypedServiceImplementation {
    /**
     * Get a user by name
     */
    GetUser: grpc.handleUnaryCall<_example_GetUserRequest__Output, _example_User>;

    /**
     * List all users
     */
    ListUsers: grpc.handleServerStreamingCall<_google_protobuf_Empty__Output, _example_User>;
}

export interface UserServiceDefinition extends grpc.ServiceDefinition {
    GetUser: MethodDefinition<
        _example_GetUserRequest,
        _example_User,
        _example_GetUserRequest__Output,
        _example_User__Output
    >;
    ListUsers: MethodDefinition<
        _google_protobuf_Empty,
        _example_User,
        _google_protobuf_Empty__Output,
        _example_User__Output
    >;
}
