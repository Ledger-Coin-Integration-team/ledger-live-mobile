/* @flow */
import React, { useCallback, useRef } from "react";
import { View, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import { Trans } from "react-i18next";
import invariant from "invariant";
import { getMainAccount } from "@ledgerhq/live-common/lib/account";
import type { Operation } from "@ledgerhq/live-common/lib/types";
import { isFirstBond } from "@ledgerhq/live-common/lib/families/polkadot/logic";
import { usePolkadotBondLoading } from "@ledgerhq/live-common/lib/families/polkadot/react";
import { accountScreenSelector } from "../../../reducers/accounts";
import { TrackScreen } from "../../../analytics";
import colors from "../../../colors";
import { NavigatorName, ScreenName } from "../../../const";
import PreventNativeBack from "../../../components/PreventNativeBack";
import ValidateSuccess from "../../../components/ValidateSuccess";
import Button from "../../../components/Button";
import LText from "../../../components/LText";

type Props = {
  navigation: any,
  route: { params: RouteParams },
};

type RouteParams = {
  accountId: string,
  deviceId: string,
  transaction: any,
  result: Operation,
};

export default function ValidationSuccess({ navigation, route }: Props) {
  const { account, parentAccount } = useSelector(accountScreenSelector(route));
  invariant(account, "account is required");

  const mainAccount = getMainAccount(account, parentAccount);
  const wasFirstBond = useRef(isFirstBond(mainAccount));
  const isLoading = usePolkadotBondLoading(mainAccount);

  const onClose = useCallback(() => {
    navigation.dangerouslyGetParent().pop();
  }, [navigation]);

  const goToNominate = useCallback(() => {
    onClose();
    navigation.navigate(NavigatorName.PolkadotNominateFlow, {
      screen: ScreenName.PolkadotNominateSelectValidators,
      params: {
        accountId: account.id,
        parentId: undefined,
      },
    });
  }, [account, navigation, onClose]);

  const goToOperationDetails = useCallback(() => {
    if (!account) return;

    const result = route.params?.result;
    if (!result) return;

    navigation.navigate(ScreenName.OperationDetails, {
      accountId: account.id,
      operation: result,
    });
  }, [account, route.params, navigation]);

  return (
    <View style={styles.root}>
      <TrackScreen category="BondFlow" name="ValidationSuccess" />
      <PreventNativeBack />
      {wasFirstBond.current ? (
        <ValidateSuccess
          onClose={onClose}
          onViewDetails={goToNominate}
          title={
            <Trans i18nKey="polkadot.bond.steps.validation.success.title" />
          }
          description={
            <Trans i18nKey="polkadot.bond.steps.validation.success.descriptionNominate" />
          }
          primaryButton={
            <View style={styles.button}>
              {isLoading && (
                <View style={styles.labelContainer}>
                  <LText style={styles.label} semiBold>
                    <Trans i18nKey="polkadot.bond.steps.validation.pending.title" />
                  </LText>
                  <LText style={[styles.label, styles.subLabel]}>
                    <Trans i18nKey="polkadot.bond.steps.validation.pending.description" />
                  </LText>
                </View>
              )}
              <Button
                event="PolkadotBondSuccessNominate"
                title={
                  <Trans i18nKey="polkadot.bond.steps.validation.success.nominate" />
                }
                isLoading={isLoading}
                disabled={isLoading}
                type="primary"
                onPress={goToNominate}
              />
            </View>
          }
          secondaryButton={
            <Button
              event="PolkadotBondSuccessLater"
              title={
                <Trans i18nKey="polkadot.bond.steps.validation.success.later" />
              }
              type="lightSecondary"
              containerStyle={styles.button}
              onPress={onClose}
            />
          }
        />
      ) : (
        <ValidateSuccess
          onClose={onClose}
          onViewDetails={goToOperationDetails}
          title={
            <Trans i18nKey="polkadot.bond.steps.validation.success.title" />
          }
          description={
            <Trans i18nKey="polkadot.bond.steps.validation.success.description" />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  button: {
    alignSelf: "stretch",
    marginTop: 24,
  },
  labelContainer: {
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  label: { fontSize: 12 },
  subLabel: { color: colors.grey },
});
