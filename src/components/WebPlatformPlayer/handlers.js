import { getAccountBridge } from "@ledgerhq/live-common/lib/bridge";
import { BigNumber } from "bignumber.js";
import { NavigatorName, ScreenName } from "../../const";
import { accountsSelector, accountSelector } from "../../reducers/accounts";

async function testFail() {
  throw new Error("THIS IS A FAILURE");
}

async function accountList(state) {
  return accountsSelector(state);
}

async function accountGet(state, dispatch, params) {
  const { accountId } = params;

  return accountSelector(state, { accountId });
}

async function accountReceive(state, dispatch, params, navigation) {
  const { accountId } = params;

  const account = accountSelector(state, { accountId });

  return new Promise((resolve, reject) => {
    if (!account) reject();

    navigation.navigate(NavigatorName.ReceiveFunds, {
      screen: ScreenName.ReceiveConnectDevice,
      params: {
        account,
        onSuccess: resolve,
        onError: () => {
          // @TODO put in correct error text maybe
          reject();
        },
      },
    });
  });
}

async function transactionSign(state, dispatch, params, navigation) {
  const {
    accountId,
    transaction,
  }: { accountId: string, transaction: Transaction } = params;

  const account = accountSelector(state, {
    accountId,
  });

  return new Promise((resolve, reject) => {
    if (!transaction) reject(new Error("Transaction required"));
    if (!account) reject(new Error("Account required"));

    const bridge = getAccountBridge(account);

    const tx = bridge.updateTransaction(bridge.createTransaction(account), {
      amount: BigNumber(transaction.amount),
      data: transaction.data ? Buffer.from(transaction.data) : undefined,
      userGasLimit: transaction.gasLimit
        ? BigNumber(transaction.gasLimit)
        : undefined,
      gasLimit: transaction.gasLimit
        ? BigNumber(transaction.gasLimit)
        : undefined,
      gasPrice: transaction.gasPrice
        ? BigNumber(transaction.gasPrice)
        : undefined,
      family: transaction.family,
      recipient: transaction.recipient,
    });

    navigation.navigate(NavigatorName.SignTransaction, {
      screen: ScreenName.SignTransactionSummary,
      params: {
        currentNavigation: ScreenName.SignTransactionSummary,
        nextNavigation: ScreenName.SignTransactionSelectDevice,
        transaction: tx,
        accountId,
        onSuccess: ({ signedOperation, transactionSignError }) => {
          if (transactionSignError) reject(transactionSignError);
          else {
            resolve(signedOperation);
            const n = navigation.dangerouslyGetParent() || navigation;
            n.dangerouslyGetParent().pop();
          }
        },
        onError: reject,
      },
    });
  });
}

async function transactionBroadcast() {
  return Promise.resolve(true);
}

const handlers = {
  "account.get": accountGet,
  "account.list": accountList,
  "account.receive": accountReceive,
  "transaction.sign": transactionSign,
  "transaction.broadcast": transactionBroadcast,
  fail: testFail,
};

export default handlers;
