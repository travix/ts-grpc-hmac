import { GrpcObject, loadPackageDefinition, ServiceClientConstructor, ServiceDefinition } from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import * as path from "path";

export interface ServiceDetails {
    path: string;
    package: string;
    service: string;
}

const protoLoaderOptions = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
};

export const getService = (serviceDetails: ServiceDetails): [ServiceDefinition, ServiceClientConstructor] => {
    const protoPath = path.join(serviceDetails.path);
    const packageDefinition = protoLoader.loadSync(protoPath, protoLoaderOptions);
    const protoObject = loadPackageDefinition(packageDefinition);
    const services = protoObject[serviceDetails.package] as GrpcObject;
    const construct = services[serviceDetails.service] as ServiceClientConstructor;
    return [construct.service, construct];
};
