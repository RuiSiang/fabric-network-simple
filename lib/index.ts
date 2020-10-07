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
interface queryChaincodeResponse {
  queryResult: string;
}

interface invokeChaincodeResponse {
  invokeResult: string;
}

export default class fabricNetworkSimple {
  contract: Contract;
  constructor(config: config) {
    this.initGateway(config);
  }
  async initGateway(config: config) {
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
      this.contract = network.getContract(config.contractName);
    } catch (error) {
      throw error;
    } finally {
    }
  }
  async queryChaincode(transaction: string, args: string[]) {
    try {
      const queryResult = await this.contract.evaluateTransaction(
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

  async invokeChaincode(
    transaction: string,
    args: string[],
    transient: TransientMap = {}
  ) {
    try {
      const invokeResult = await this.contract
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
}
