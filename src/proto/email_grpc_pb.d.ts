// package: 
// file: email.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "grpc";
import * as email_pb from "./email_pb";

interface IEmailServiceService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    sendEmail: IEmailServiceService_ISendEmail;
}

interface IEmailServiceService_ISendEmail extends grpc.MethodDefinition<email_pb.SendEmailRequest, email_pb.SendEmailResponse> {
    path: "/EmailService/SendEmail";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<email_pb.SendEmailRequest>;
    requestDeserialize: grpc.deserialize<email_pb.SendEmailRequest>;
    responseSerialize: grpc.serialize<email_pb.SendEmailResponse>;
    responseDeserialize: grpc.deserialize<email_pb.SendEmailResponse>;
}

export const EmailServiceService: IEmailServiceService;

export interface IEmailServiceServer {
    sendEmail: grpc.handleUnaryCall<email_pb.SendEmailRequest, email_pb.SendEmailResponse>;
}

export interface IEmailServiceClient {
    sendEmail(request: email_pb.SendEmailRequest, callback: (error: grpc.ServiceError | null, response: email_pb.SendEmailResponse) => void): grpc.ClientUnaryCall;
    sendEmail(request: email_pb.SendEmailRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: email_pb.SendEmailResponse) => void): grpc.ClientUnaryCall;
    sendEmail(request: email_pb.SendEmailRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: email_pb.SendEmailResponse) => void): grpc.ClientUnaryCall;
}

export class EmailServiceClient extends grpc.Client implements IEmailServiceClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
    public sendEmail(request: email_pb.SendEmailRequest, callback: (error: grpc.ServiceError | null, response: email_pb.SendEmailResponse) => void): grpc.ClientUnaryCall;
    public sendEmail(request: email_pb.SendEmailRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: email_pb.SendEmailResponse) => void): grpc.ClientUnaryCall;
    public sendEmail(request: email_pb.SendEmailRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: email_pb.SendEmailResponse) => void): grpc.ClientUnaryCall;
}
