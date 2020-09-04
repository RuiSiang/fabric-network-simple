import {
  Wallets,
  X509Identity,
  Gateway,
  GatewayOptions,
  TransientMap,
  Contract,
} from "fabric-network";

export interface config {
  channelName: string;
  contractName: string;
  connectionProfile: {
    name: string;
    version: string;
    channels: {
      [channelName: string]: {
        orderers: string[];
        peers: string[];
      };
    };
    organizations: {
      [orgName: string]: {
        mspid: string;
        peers: string[];
        certificateAuthorities: string[];
      };
    };
    orderers: {
      [ordererName: string]: {
        url: string;
        grpcOptions: { "ssl-target-name-override": string };
        tlsCACerts: { path: string };
      };
    };
    peers: {
      [peerName: string]: {
        url: string;
        grpcOptions: { "ssl-target-name-override": string };
        tlsCACerts: { path: string };
      };
    };
  };
  identity: {
    mspid: string;
    certificate: string;
    privateKey: string;
  };
  settings: {
    enableDiscovery: boolean;
    asLocalhost: boolean;
  };
}

let contract: Contract;
export async function initGateway(config: config) {
  try {
    const wallet = await Wallets.newInMemoryWallet();
    const x509Identity: X509Identity = {
      credentials: {
        certificate: config.identity.certificate,
        privateKey: config.identity.privateKey,
      },
      mspId: config.identity.mspid,
      type: "X.509",
    };
    await wallet.put(config.identity.mspid, x509Identity);
    const gatewayOptions: GatewayOptions = {
      identity: config.identity.mspid,
      wallet,
      discovery: {
        enabled: config.settings.enableDiscovery,
        asLocalhost: config.settings.asLocalhost,
      },
    };
    const gateway = new Gateway();
    await gateway.connect(config.connectionProfile, gatewayOptions);
    const network = await gateway.getNetwork(config.channelName);
    contract = network.getContract(config.contractName);
  } catch (error) {
    console.log(error);
    return false;
  } finally {
    return true;
  }
}

interface queryChaincodeResponse {
  queryResult: string;
}
export async function queryChaincode(transaction: string, args: string[]) {
  try {
    const queryResult = await contract.evaluateTransaction(
      transaction,
      ...args
    );
    var result = "[]";
    if (queryResult) {
      result = queryResult.toString();
    }
    return <queryChaincodeResponse>{ queryResult: result };
  } catch (error) {
    console.error(
      `Failed to query transaction: "${transaction}" with arguments: "${args}", error: "${error}"`
    );
  }
}

interface invokeChaincodeResponse {
  invokeResult: string;
}
export async function invokeChaincode(
  transaction: string,
  args: string[],
  transient: TransientMap = {}
) {
  try {
    const invokeResult = await contract
      .createTransaction(transaction)
      .setTransient(transient)
      .submit(...args);
    var result = "[]";
    if (invokeResult) {
      result = invokeResult.toString();
    }
    return <invokeChaincodeResponse>{ invokeResult: result };
  } catch (error) {
    console.error(
      `Failed to invoke transaction: "${transaction}" with arguments: "${args}", transient: "${transient}",  error: "${error}"`
    );
  }
}
