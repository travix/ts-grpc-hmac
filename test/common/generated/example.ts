import type * as grpc from "@grpc/grpc-js";
import type { MessageTypeDefinition } from "@grpc/proto-loader";

import type {
    UserServiceClient as _example_UserServiceClient,
    UserServiceDefinition as _example_UserServiceDefinition
} from "./example/UserService";

type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
    new (...args: ConstructorParameters<Constructor>): Subtype;
};

export interface ProtoGrpcType {
    example: {
        Empty: MessageTypeDefinition;
        GetUserRequest: MessageTypeDefinition;
        User: MessageTypeDefinition;
        /**
         * UserService is a service exposed by Grpc servers that provides user management
         */
        UserService: SubtypeConstructor<typeof grpc.Client, _example_UserServiceClient> & {
            service: _example_UserServiceDefinition;
        };
    };
}
