// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var email_pb = require('./email_pb.js');

function serialize_SendEmailRequest(arg) {
  if (!(arg instanceof email_pb.SendEmailRequest)) {
    throw new Error('Expected argument of type SendEmailRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_SendEmailRequest(buffer_arg) {
  return email_pb.SendEmailRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_SendEmailResponse(arg) {
  if (!(arg instanceof email_pb.SendEmailResponse)) {
    throw new Error('Expected argument of type SendEmailResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_SendEmailResponse(buffer_arg) {
  return email_pb.SendEmailResponse.deserializeBinary(new Uint8Array(buffer_arg));
}


var EmailServiceService = exports.EmailServiceService = {
  sendEmail: {
    path: '/EmailService/SendEmail',
    requestStream: false,
    responseStream: false,
    requestType: email_pb.SendEmailRequest,
    responseType: email_pb.SendEmailResponse,
    requestSerialize: serialize_SendEmailRequest,
    requestDeserialize: deserialize_SendEmailRequest,
    responseSerialize: serialize_SendEmailResponse,
    responseDeserialize: deserialize_SendEmailResponse,
  },
};

exports.EmailServiceClient = grpc.makeGenericClientConstructor(EmailServiceService, 'EmailService');
