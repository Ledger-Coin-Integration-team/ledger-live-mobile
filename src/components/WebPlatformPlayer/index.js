// @flow
import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import { useSelector } from "react-redux";
import {
  ActivityIndicator,
  StyleSheet,
  View,
  TouchableOpacity,
} from "react-native";
import { WebView } from "react-native-webview";
import { useNavigation, useTheme } from "@react-navigation/native";

import { JSONRPCRequest } from "json-rpc-2.0";

import type { SignedOperation } from "@ledgerhq/live-common/lib/types";
import { getEnv } from "@ledgerhq/live-common/lib/env";
import { getAccountBridge } from "@ledgerhq/live-common/lib/bridge";
import {
  listCryptoCurrencies,
  findCryptoCurrencyById,
} from "@ledgerhq/live-common/lib/currencies/index";

import type { RawPlatformTransaction } from "@ledgerhq/live-common/lib/platform/rawTypes";
import { useJSONRPCServer } from "@ledgerhq/live-common/lib/platform/JSONRPCServer";
import {
  accountToPlatformAccount,
  currencyToPlatformCurrency,
} from "@ledgerhq/live-common/lib/platform/converters";
import {
  serializePlatformAccount,
  deserializePlatformTransaction,
} from "@ledgerhq/live-common/lib/platform/serializers";

import { NavigatorName, ScreenName } from "../../const";
import { broadcastSignedTx } from "../../logic/screenTransactionHooks";
import { accountsSelector } from "../../reducers/accounts";
import UpdateIcon from "../../icons/Update";

import type { Manifest } from "./type";
import Color from "color";

const injectedCode = `
  window.postMessage = event => {
    window.ReactNativeWebView.postMessage(event);
  }
  true;
`;

type Props = {
  manifest: Manifest,
};

const WebPlatformPlayer = ({ manifest }: Props) => {
  const targetRef: { current: null | WebView } = useRef(null);
  const accounts = useSelector(accountsSelector);
  const currencies = useMemo(() => listCryptoCurrencies(), []);

  // eslint-disable-next-line no-unused-vars
  const [loadDate, setLoadDate] = useState(Date.now());
  const [widgetLoaded, setWidgetLoaded] = useState(false);
  const [widgetError, setWidgetError] = useState(false);

  const navigation = useNavigation();

  const listAccounts = useCallback(
    () =>
      accounts.map(account =>
        serializePlatformAccount(accountToPlatformAccount(account)),
      ),
    [accounts],
  );

  const listCurrencies = useCallback(
    () => currencies.map(currencyToPlatformCurrency),
    [currencies],
  );

  const requestAccount = useCallback(
    ({
      currencies: currencyIds = [],
      allowAddAccount,
    }: {
      currencies?: string[],
      allowAddAccount?: boolean,
    }) =>
      new Promise((resolve, reject) => {
        // handle no curencies selected case
        const cryptoCurrencies =
          currencyIds.length > 0 ? currencyIds : currencies.map(({ id }) => id);

        const foundAccounts =
          cryptoCurrencies && cryptoCurrencies.length
            ? accounts.filter(a => cryptoCurrencies.includes(a.currency.id))
            : accounts;

        // @TODO replace with correct error
        if (foundAccounts.length <= 0 && !allowAddAccount) {
          reject(new Error("No accounts found matching request"));
          return;
        }

        // if single account found return it
        if (foundAccounts.length === 1 && !allowAddAccount) {
          resolve(foundAccounts[0]);
          return;
        }

        // list of queried cryptoCurrencies with one or more accounts -> used in case of not allowAddAccount and multiple accounts selectable
        const currenciesDiff = allowAddAccount
          ? cryptoCurrencies
          : foundAccounts
              .map(a => a.currency.id)
              .filter(
                (c, i, arr) =>
                  cryptoCurrencies.includes(c) && i === arr.indexOf(c),
              );

        // if single currency available redirect to select account directly
        if (currenciesDiff.length === 1) {
          const currency = findCryptoCurrencyById(currenciesDiff[0]);
          if (!currency) {
            // @TODO replace with correct error
            reject(new Error("Currency not found"));
            return;
          }
          navigation.navigate(NavigatorName.RequestAccount, {
            screen: ScreenName.RequestAccountsSelectAccount,
            params: {
              currencies: currenciesDiff,
              currency,
              allowAddAccount,
              onSuccess: account =>
                resolve(
                  serializePlatformAccount(accountToPlatformAccount(account)),
                ),
              onError: reject,
            },
          });
        } else {
          navigation.navigate(NavigatorName.RequestAccount, {
            screen: ScreenName.RequestAccountsSelectCrypto,
            params: {
              currencies: currenciesDiff,
              allowAddAccount,
              // TODO: serialize?
              onSuccess: resolve,
              onError: reject,
            },
          });
        }
      }),
    [accounts, currencies, navigation],
  );

  const receiveOnAccount = useCallback(
    ({ accountId }: { accountId: string }) => {
      const account = accounts.find(account => account.id === accountId);

      return new Promise((resolve, reject) => {
        if (!account) {
          reject();
          return;
        }

        navigation.navigate(NavigatorName.ReceiveFunds, {
          screen: ScreenName.ReceiveConnectDevice,
          params: {
            account,
            onSuccess: resolve,
            onError: e => {
              // @TODO put in correct error text maybe
              reject(e);
            },
          },
        });
      });
    },
    [accounts, navigation],
  );

  const signTransaction = useCallback(
    ({
      accountId,
      transaction,
    }: {
      accountId: string,
      transaction: RawPlatformTransaction,
    }) => {
      const platformTransaction = deserializePlatformTransaction(transaction);
      const account = accounts.find(account => account.id === accountId);

      return new Promise((resolve, reject) => {
        // @TODO replace with correct error
        if (!transaction) {
          reject(new Error("Transaction required"));
          return;
        }
        if (!account) {
          reject(new Error("Account required"));
          return;
        }

        const bridge = getAccountBridge(account);

        const tx = bridge.updateTransaction(bridge.createTransaction(account), {
          amount: platformTransaction.amount,
          data: platformTransaction?.data && undefined,
          userGasLimit: platformTransaction?.gasLimit && undefined,
          gasLimit: platformTransaction?.gasLimit && undefined,
          gasPrice: platformTransaction?.gasPrice && undefined,
          family: platformTransaction.family,
          recipient: platformTransaction.recipient,
          feesStrategy: "custom",
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
    },
    [accounts, navigation],
  );

  const broadcastTransaction = useCallback(
    async ({
      accountId,
      signedTransaction,
    }: {
      accountId: string,
      signedTransaction: SignedOperation,
    }) => {
      const account = accounts.find(a => a.id === accountId);

      return new Promise((resolve, reject) => {
        // @TODO replace with correct error
        if (!signedTransaction) {
          reject(new Error("Transaction required"));
          return;
        }
        if (!account) {
          reject(new Error("Account required"));
          return;
        }

        if (!getEnv("DISABLE_TRANSACTION_BROADCAST")) {
          broadcastSignedTx(account, null, signedTransaction).then(
            op => resolve(op.hash),
            reject,
          );
        }
      });
    },
    [accounts],
  );

  const handlers = useMemo(
    () => ({
      "account.list": listAccounts,
      "currency.list": listCurrencies,
      "account.request": requestAccount,
      "account.receive": receiveOnAccount,
      "transaction.sign": signTransaction,
      "transaction.broadcast": broadcastTransaction,
    }),
    [
      listAccounts,
      listCurrencies,
      requestAccount,
      receiveOnAccount,
      signTransaction,
      broadcastTransaction,
    ],
  );

  const handleSend = useCallback(
    (request: JSONRPCRequest) => {
      targetRef?.current?.postMessage(
        JSON.stringify(request),
        manifest.url.origin,
      );
    },
    [manifest],
  );

  const [receive] = useJSONRPCServer(handlers, handleSend);

  const handleMessage = useCallback(
    e => {
      // FIXME: event isn't the same on desktop & mobile
      // if (e.isTrusted && e.origin === manifest.url.origin && e.data) {
      if (e.nativeEvent?.data) {
        receive(JSON.parse(e.nativeEvent.data));
      }
    },
    [receive],
  );

  const handleLoad = useCallback(() => {
    setWidgetError(false);
    setWidgetLoaded(true);
  }, []);

  const handleReload = useCallback(() => {
    setLoadDate(Date.now());
    setWidgetLoaded(false);
  }, []);

  useEffect(() => {
    let timeout;
    if (!widgetLoaded) {
      timeout = setTimeout(() => {
        setWidgetError(true);
      }, 3000);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [widgetLoaded, widgetError]);

  const {
    colors: { background, text },
  } = useTheme();

  const bgColorHex = useMemo(() => new Color(background).hex(), [background]);
  const textColorHex = useMemo(() => new Color(text).hex(), [text]);

  return (
    <View style={[styles.root]}>
      <WebView
        ref={targetRef}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.center}>
            <ActivityIndicator size="large" />
          </View>
        )}
        originWhitelist={["https://*"]}
        allowsInlineMediaPlayback
        source={{
          //uri: `${manifest.url.toString()}&${loadDate}`,
          uri: `${manifest.url.toString()}&backgroundColor=${bgColorHex}&textColor=${textColorHex}&${loadDate}`,
        }}
        onLoad={handleLoad}
        injectedJavaScript={injectedCode}
        onMessage={handleMessage}
        mediaPlaybackRequiresUserAction={false}
        scalesPageToFitmediaPlaybackRequiresUserAction
        automaticallyAdjustContentInsets={false}
        scrollEnabled={true}
        style={styles.webview}
        androidHardwareAccelerationDisabled
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  center: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
  },
  modalContainer: {
    flexDirection: "row",
  },
  webview: {
    flex: 0,
    width: "100%",
    height: "100%",
  },
});

export default WebPlatformPlayer;
