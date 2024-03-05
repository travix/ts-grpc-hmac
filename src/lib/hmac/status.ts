import { status, StatusBuilder } from "@grpc/grpc-js";

export const ErrInvalidHmacKeyID = new StatusBuilder()
    .withCode(status.UNAUTHENTICATED)
    .withDetails("Invalid x-hmac-key-id")
    .build();

export const ErrInvalidHmacSignature = new StatusBuilder()
    .withCode(status.UNAUTHENTICATED)
    .withDetails("Mismatched x-hmac-signature")
    .build();

export const ErrMissingHmacSignature = new StatusBuilder()
    .withCode(status.UNAUTHENTICATED)
    .withDetails("Missing x-hmac-signature")
    .build();

export const ErrMissingMetadata = new StatusBuilder()
    .withCode(status.UNAUTHENTICATED)
    .withDetails("Missing metadata")
    .build();

export const ErrInternal = new StatusBuilder().withCode(status.INTERNAL).withDetails("Internal error").build();

export const ErrInvalidMetadata = new StatusBuilder()
    .withCode(status.UNAUTHENTICATED)
    .withDetails("Invalid metadata")
    .build();

export const ErrUnauthenticated = new StatusBuilder()
    .withCode(status.UNAUTHENTICATED)
    .withDetails("Unauthenticated")
    .build();
