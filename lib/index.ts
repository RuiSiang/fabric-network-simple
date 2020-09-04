import * as fs from "fs";
import {
  Wallets,
  Gateway,
  GatewayOptions,
  DefaultEventHandlerStrategies,
  TransientMap,
  Contract,
} from "fabric-network";

const mspid: string = process.env.sdkMspId || "Org1MSP";

let contract: Contract;
async function initGateway() {
  try {
    const connectionProfileJson = fs
      .readFileSync(`./config/connectionprofile-${mspid}.json`)
      .toString();
    const connectionProfile = JSON.parse(connectionProfileJson);
    const wallet = await Wallets.newFileSystemWallet("./config/wallets");
    const gatewayOptions: GatewayOptions = {
      identity: mspid,
      wallet,
      discovery: { enabled: false, asLocalhost: false },
      eventHandlerOptions: {
        strategy: DefaultEventHandlerStrategies.MSPID_SCOPE_ALLFORTX,
      },
    };
    const gateway = new Gateway();
    await gateway.connect(connectionProfile, gatewayOptions);
    const network = await gateway.getNetwork("myc");
    contract = network.getContract("iovcases");
  } catch (error) {
    console.log(error);
  }
}
initGateway();

interface queryChaincodeResponse {
  queryResult: string;
}
async function queryChaincode(transaction: string, args: string[]) {
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
async function invokeChaincode(
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

export default { invokeChaincode, queryChaincode};
