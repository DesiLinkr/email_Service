// package: 
// file: email.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";

export class SendEmailRequest extends jspb.Message { 
    getTo(): string;
    setTo(value: string): SendEmailRequest;
    getSubject(): string;
    setSubject(value: string): SendEmailRequest;
    getBody(): string;
    setBody(value: string): SendEmailRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): SendEmailRequest.AsObject;
    static toObject(includeInstance: boolean, msg: SendEmailRequest): SendEmailRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: SendEmailRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): SendEmailRequest;
    static deserializeBinaryFromReader(message: SendEmailRequest, reader: jspb.BinaryReader): SendEmailRequest;
}

export namespace SendEmailRequest {
    export type AsObject = {
        to: string,
        subject: string,
        body: string,
    }
}

export class SendEmailResponse extends jspb.Message { 
    getSuccess(): boolean;
    setSuccess(value: boolean): SendEmailResponse;
    getMessage(): string;
    setMessage(value: string): SendEmailResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): SendEmailResponse.AsObject;
    static toObject(includeInstance: boolean, msg: SendEmailResponse): SendEmailResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: SendEmailResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): SendEmailResponse;
    static deserializeBinaryFromReader(message: SendEmailResponse, reader: jspb.BinaryReader): SendEmailResponse;
}

export namespace SendEmailResponse {
    export type AsObject = {
        success: boolean,
        message: string,
    }
}
