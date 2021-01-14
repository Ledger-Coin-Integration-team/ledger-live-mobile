/* @flow */
import { BigNumber } from "bignumber.js";
import useBridgeTransaction from "@ledgerhq/live-common/lib/bridge/useBridgeTransaction";
import React, { useCallback, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Switch,
  Keyboard,
  SafeAreaView,
} from "react-native";
import { useSelector } from "react-redux";
import { Trans } from "react-i18next";
import invariant from "invariant";
import type { Transaction } from "@ledgerhq/live-common/lib/types";
import { useDebounce } from "@ledgerhq/live-common/lib/hooks/useDebounce";
import {
  getAccountUnit,
  getMainAccount,
} from "@ledgerhq/live-common/lib/account";
import { getAccountBridge } from "@ledgerhq/live-common/lib/bridge";
import { useTheme } from "@react-navigation/native";
import { accountScreenSelector } from "../../../reducers/accounts";
import { ScreenName } from "../../../const";
import { TrackScreen } from "../../../analytics";
import LText from "../../../components/LText";
import CurrencyUnitValue from "../../../components/CurrencyUnitValue";
import Button from "../../../components/Button";
import KeyboardView from "../../../components/KeyboardView";
import RetryButton from "../../../components/RetryButton";
import CancelButton from "../../../components/CancelButton";
import GenericErrorBottomModal from "../../../components/GenericErrorBottomModal";
import CurrencyInput from "../../../components/CurrencyInput";
import TranslatedError from "../../../components/TranslatedError";
import SendRowsFee from "../SendRowsFee";

type Props = {
  navigation: any,
  route: { params: RouteParams },
};

type RouteParams = {
  accountId: string,
  transaction: Transaction,
};

export default function PolkadotRebondAmount({ navigation, route }: Props) {
  const { colors } = useTheme();
  const { account, parentAccount } = useSelector(accountScreenSelector(route));
  invariant(account, "account is required");

  const bridge = getAccountBridge(account, parentAccount);
  const mainAccount = getMainAccount(account, parentAccount);

  const [maxSpendable, setMaxSpendable] = useState(null);

  const {
    transaction,
    setTransaction,
    status,
    bridgePending,
    bridgeError,
  } = useBridgeTransaction(() => {
    const t = bridge.createTransaction(mainAccount);

    const transaction = bridge.updateTransaction(t, {
      mode: "rebond",
    });

    return { account: mainAccount, transaction };
  });

  const debouncedTransaction = useDebounce(transaction, 500);

  useEffect(() => {
    if (!account) return;

    let cancelled = false;
    getAccountBridge(account, parentAccount)
      .estimateMaxSpendable({
        account,
        parentAccount,
        transaction: debouncedTransaction,
      })
      .then(estimate => {
        if (cancelled) return;

        setMaxSpendable(estimate);
      });

    // eslint-disable-next-line consistent-return
    return () => {
      cancelled = true;
    };
  }, [account, parentAccount, debouncedTransaction]);

  const onChange = useCallback(
    amount => {
      if (!amount.isNaN()) {
        setTransaction(bridge.updateTransaction(transaction, { amount }));
      }
    },
    [setTransaction, transaction, bridge],
  );

  const toggleUseAllAmount = useCallback(() => {
    const bridge = getAccountBridge(account, parentAccount);
    if (!transaction) return;

    setTransaction(
      bridge.updateTransaction(transaction, {
        amount: BigNumber(0),
        useAllAmount: !transaction.useAllAmount,
      }),
    );
  }, [setTransaction, account, parentAccount, transaction]);

  const onContinue = useCallback(() => {
    navigation.navigate(ScreenName.PolkadotRebondSelectDevice, {
      accountId: account.id,
      transaction,
      status,
    });
  }, [account, navigation, transaction, status]);

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

  const blur = useCallback(() => Keyboard.dismiss(), []);

  if (!account || !transaction) return null;

  const { useAllAmount } = transaction;
  const { amount } = status;
  const unit = getAccountUnit(account);

  const error = amount.eq(0) || bridgePending ? null : status.errors.amount;
  const warning = status.warnings.amount;

  return (
    <>
      <TrackScreen category="RebondFlow" name="Amount" />
      <SafeAreaView
        style={[
          styles.root,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        <KeyboardView style={styles.container}>
          <TouchableWithoutFeedback onPress={blur}>
            <View style={styles.root}>
              <View style={styles.wrapper}>
                <CurrencyInput
                  editable={!useAllAmount}
                  isActive
                  onChange={onChange}
                  unit={unit}
                  value={amount}
                  renderRight={
                    <LText
                      semiBold
                      style={[styles.currency]}
                      color={warning ? "orange" : error ? "alert" : "grey"}
                    >
                      {unit.code}
                    </LText>
                  }
                  autoFocus
                  style={styles.inputContainer}
                  inputStyle={[
                    styles.inputStyle,
                    warning && { color: colors.orange },
                    error && { color: colors.alert },
                  ]}
                  hasError={!!error}
                  hasWarning={!!warning}
                />
                <LText
                  style={[styles.fieldStatus]}
                  color={warning ? "orange" : error ? "alert" : "darkBlue"}
                  numberOfLines={2}
                >
                  <TranslatedError error={error || warning} />
                </LText>
              </View>
              <View style={styles.bottomWrapper}>
                <View style={styles.available}>
                  <View style={styles.availableLeft}>
                    <LText>
                      <Trans i18nKey="polkadot.rebond.steps.amount.availableLabel" />
                    </LText>
                    <LText semiBold>
                      {maxSpendable ? (
                        <CurrencyUnitValue
                          showCode
                          unit={unit}
                          value={maxSpendable}
                        />
                      ) : (
                        "-"
                      )}
                    </LText>
                  </View>
                  {typeof useAllAmount === "boolean" ? (
                    <View style={styles.availableRight}>
                      <LText style={styles.maxLabel}>
                        <Trans i18nKey="polkadot.rebond.steps.amount.maxLabel" />
                      </LText>
                      <Switch
                        style={styles.switch}
                        value={useAllAmount}
                        onValueChange={toggleUseAllAmount}
                      />
                    </View>
                  ) : null}
                </View>
                <SendRowsFee
                  account={account}
                  parentAccount={parentAccount}
                  transaction={transaction}
                />
                <View style={styles.continueWrapper}>
                  <Button
                    event="PolkadotRebondAmountContinue"
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
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardView>
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
  },
  topContainer: { paddingHorizontal: 32, flexShrink: 1 },
  container: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 16,
    alignItems: "stretch",
    justifyContent: "flex-start",
  },
  available: {
    flexDirection: "row",
    display: "flex",
    flexGrow: 1,
  },
  availableRight: {
    alignItems: "center",
    justifyContent: "flex-end",
    flexDirection: "row",
  },
  availableLeft: {
    justifyContent: "center",
    flexGrow: 1,
  },
  maxLabel: {
    marginRight: 4,
  },
  bottomWrapper: {
    flexGrow: 0,
    alignItems: "stretch",
    justifyContent: "flex-end",
    flexShrink: 1,
  },
  continueWrapper: {
    alignSelf: "stretch",
    alignItems: "stretch",
    justifyContent: "flex-end",
    paddingBottom: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
  buttonRight: {
    marginLeft: 8,
  },
  wrapper: {
    flexGrow: 1,
    flexShrink: 1,
    flexDirection: "column",
    alignContent: "center",
    justifyContent: "center",
  },
  inputContainer: {
    flexBasis: 75,
  },
  inputStyle: {
    flex: 0,
    flexShrink: 1,
    textAlign: "center",
  },
  currency: {
    fontSize: 32,
  },
  fieldStatus: {
    fontSize: 14,
    textAlign: "center",
  },
  switch: {
    opacity: 0.99,
  },
});
