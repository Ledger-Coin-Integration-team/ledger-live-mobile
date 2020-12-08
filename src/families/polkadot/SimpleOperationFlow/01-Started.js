// @flow
import invariant from "invariant";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import SafeAreaView from "react-native-safe-area-view";
import { Trans } from "react-i18next";
import { useSelector } from "react-redux";

import type { Transaction } from "@ledgerhq/live-common/lib/types";
import { getAccountBridge } from "@ledgerhq/live-common/lib/bridge";
import { getMainAccount } from "@ledgerhq/live-common/lib/account";
import useBridgeTransaction from "@ledgerhq/live-common/lib/bridge/useBridgeTransaction";

import { accountScreenSelector } from "../../../reducers/accounts";
import colors from "../../../colors";
import { ScreenName } from "../../../const";
import { TrackScreen } from "../../../analytics";
import Button from "../../../components/Button";
import LText from "../../../components/LText";
import RetryButton from "../../../components/RetryButton";
import CancelButton from "../../../components/CancelButton";
import GenericErrorBottomModal from "../../../components/GenericErrorBottomModal";
import Info from "../../../icons/Info";

import SendRowsFee from "../SendRowsFee";

const forceInset = { bottom: "always" };

type RouteParams = {
  transaction: Transaction,
  mode: "chill" | "withdrawUnbonded",
};

type Props = {
  navigation: any,
  route: { params: RouteParams },
};

export default function PolkadotSimpleOperationStarted({
  navigation,
  route,
}: Props) {
  const { mode } = route.params;
  const { account, parentAccount } = useSelector(accountScreenSelector(route));

  invariant(account, "account required");

  const mainAccount = getMainAccount(account, parentAccount);
  const bridge = getAccountBridge(account, parentAccount);

  const { polkadotResources } = mainAccount;

  invariant(polkadotResources, "polkadotResources required");

  const {
    transaction,
    setTransaction,
    status,
    bridgePending,
    bridgeError,
  } = useBridgeTransaction(() => {
    const t = bridge.createTransaction(mainAccount);

    const transaction = bridge.updateTransaction(t, {
      mode,
    });

    return { account: mainAccount, transaction };
  });

  const onContinue = useCallback(() => {
    navigation.navigate(ScreenName.PolkadotSimpleOperationSelectDevice, {
      accountId: account.id,
      mode,
      transaction,
      status,
    });
  }, [account, navigation, transaction, status, mode]);

  const [bridgeErr, setBridgeErr] = useState(bridgeError);

  useEffect(() => setBridgeErr(bridgeError), [bridgeError]);

  const onBridgeErrorCancel = useCallback(() => {
    setBridgeErr(null);
    const parent = navigation.dangerouslyGetParent();
    if (parent) parent.goBack();
  }, [navigation]);

  const onBridgeErrorRetry = useCallback(() => {
    setBridgeErr(null);
    if (!transaction) return;
    setTransaction(bridge.updateTransaction(transaction, {}));
  }, [setTransaction, transaction, bridge]);

  if (!account || !transaction) return null;

  return (
    <>
      <SafeAreaView style={styles.root} forceInset={forceInset}>
        <View style={styles.container}>
          <TrackScreen category="SimpleOperationFlow" name="Started" />
          <View style={styles.content}>
            <LText secondary style={styles.description}>
              <Trans
                i18nKey={`polkadot.simpleOperation.modes.${mode}.description`}
              />
            </LText>
            <View style={styles.info}>
              <Info size={22} color={colors.live} />
              <LText
                semiBold
                style={[styles.text, styles.infoText]}
                numberOfLines={3}
              >
                <Trans
                  i18nKey={`polkadot.simpleOperation.modes.${mode}.info`}
                />
              </LText>
            </View>
          </View>
        </View>
        <View style={styles.footer}>
          <SendRowsFee
            account={account}
            parentAccount={parentAccount}
            transaction={transaction}
          />
          <Button
            event="PolkadotSimpleOperationContinue"
            type="primary"
            title={
              <Trans
                i18nKey={
                  !bridgePending
                    ? "common.continue"
                    : "send.amount.loadingNetwork"
                }
              />
            }
            onPress={onContinue}
            disabled={!!status.errors.amount || bridgePending}
          />
        </View>
      </SafeAreaView>

      <GenericErrorBottomModal
        error={bridgeErr}
        onClose={onBridgeErrorRetry}
        footerButtons={
          <>
            <CancelButton
              containerStyle={styles.button}
              onPress={onBridgeErrorCancel}
            />
            <RetryButton
              containerStyle={[styles.button, styles.buttonRight]}
              onPress={onBridgeErrorRetry}
            />
          </>
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    flex: 1,
    padding: 16,
    paddingVertical: 32,
    alignItems: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    lineHeight: 33,
    color: colors.darkBlue,
    paddingVertical: 16,
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.darkBlue,
    textAlign: "center",
    marginVertical: 16,
    paddingHorizontal: 32,
  },
  info: {
    flexShrink: 0,
    width: "100%",
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    color: colors.darkBlue,
    textAlign: "right",
    flex: 1,
  },
  infoText: {
    color: colors.live,
    textAlign: "left",
    marginLeft: 8,
  },
  footer: {
    padding: 16,
  },
  buttonContainer: {
    marginTop: 4,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
  buttonRight: {
    marginLeft: 8,
  },
});
