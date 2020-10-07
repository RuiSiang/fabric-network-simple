# fabric-network-simple
![](https://github.com/RuiSiang/fabric-network-simple/workflows/Node.js%20CI/badge.svg)

A simplified wrapper for fabric-network. Typescript usage is recommended for auto config checks.

## Installation
```
npm install fabric-network-simple
yarn add fabric-network-simple
```

##Include
```typescript
import fabricNetworkSimple from "fabric-network-simple";
```

## Configuration
fabric-network-simple reads configurations from a config object as an argument in function initGateway
<details><summary>Example Configuration</summary>
<p>
  
```typescript
const config: fabricNetworkSimple.config = {
  channelName: "test-channel",
  contractName: "test-contract",
  connectionProfile: {
    name: "Network",
    version: "1.1",
    channels: {
      "test-channel": {
        orderers: ["orderer.example.com"],
        peers: ["peer0.org1.example.com", "peer0.org2.example.com"],
      },
    },
    organizations: {
      Org1: {
        mspid: "Org1MSP",
        peers: ["peer0.org1.example.com"],
        certificateAuthorities: ["ca-org1"],
      },
      Org2: {
        mspid: "Org2MSP",
        peers: ["peer0.org2.example.com"],
        certificateAuthorities: ["ca-org2"],
      },
    },
    orderers: {
      "orderer.example.com": {
        url: "grpcs://localhost:7050",
        grpcOptions: {
          "ssl-target-name-override": "orderer.example.com",
        },
        tlsCACerts: {
          path:
            "test/ordererOrganizations/example.com/orderers/orderer.example.com/tlscacerts/example.com-cert.pem",
        },
      },
    },
    peers: {
      "peer0.org1.example.com": {
        url: "grpcs://localhost:7051",
        grpcOptions: {
          "ssl-target-name-override": "peer0.org1.example.com",
        },
        tlsCACerts: {
          path:
            "test/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tlscacerts/org1.example.com-cert.pem",
        },
      },
      "peer0.org2.example.com": {
        url: "grpcs://localhost:8051",
        grpcOptions: {
          "ssl-target-name-override": "peer0.org2.example.com",
        },
        tlsCACerts: {
          path:
            "test/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tlscacerts/org2.example.com-cert.pem",
        },
      },
    },
  },
  identity: {
    mspid: 'Org1MSP',
    certificate: '-----BEGIN CERTIFICATE-----\nMIIB9DCCAZugAwIBAgIQX6iGazkZVMAKUvWR+bX//DAKBggqhkjOPQQDAjBbMQsw\nCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMNU2FuIEZy\nYW5jaXNjbzENMAsGA1UEChMEb3JnMTEQMA4GA1UEAxMHY2Eub3JnMTAeFw0yMDA4\nMTQwNzI0MDBaFw0zMDA4MTIwNzI0MDBaME8xCzAJBgNVBAYTAlVTMRMwEQYDVQQI\nEwpDYWxpZm9ybmlhMRYwFAYDVQQHEw1TYW4gRnJhbmNpc2NvMRMwEQYDVQQDDApB\nZG1pbkBvcmcxMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEywRWLrKHCeMACzKq\noaktPkjczbxAA+zqS5AVlKQUVwAmiUaNF/cQHnjdHeDNNYZAAaUwRY8xnxP4DJRT\n7g5GT6NNMEswDgYDVR0PAQH/BAQDAgeAMAwGA1UdEwEB/wQCMAAwKwYDVR0jBCQw\nIoAg2ZieZeymeQE20xuqymU3R0kMoRUnUO+ic3TqcVW0ZWEwCgYIKoZIzj0EAwID\nRwAwRAIgbBhgPWUo8pnOZhODSjsKqzaP8jxLv3G+3hG/v32b7OICIELn9dQ3ua0Y\nOf6Q2XKcXvI/6BFXEMJzJkCv52MKTjKl\n-----END CERTIFICATE-----\n',
    privateKey: '-----BEGIN PRIVATE KEY-----\r\nMIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgpiKVKhRCAhxWB5of\r\n64AOB7741SQPNARB2Ob12Ag7TDOhRANCAATLBFYusocJ4wALMqqhqS0+SNzNvEAD\r\n7OpLkBWUpBRXACaJRo0X9xAeeN0d4M01hkABpTBFjzGfE/gMlFPuDkZP\r\n-----END PRIVATE KEY-----\r\n',
  },
  settings: {
    enableDiscovery: true,
    asLocalhost: true,
  }
```

</p>
</details>


## Usage
Say we have a query function "set", and invoke function "get" that gets/sets a number to a variable on the chaincode
```typescript
//constructor
const fabricNetwork = 
  new fabricNetworkSimple(
    config //config object, see example config section
  );

//sets variable to 5
const invokeResult = 
  await fabricNetwork.invokeChaincode(
    'set', //chaincode method
    [5], //arguments
    {} //transient data
  );
//gets variable from ledger
const queryResult = 
  await fabricNetwork.queryChaincode(
    'get', //chaincode method
    [] //arguments
  );
console.log('queryResult'); //prints 5
```
