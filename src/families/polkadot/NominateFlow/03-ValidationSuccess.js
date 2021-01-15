/* @flow */
import React, { useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import { Trans } from "react-i18next";
import invariant from "invariant";

import type { Operation } from "@ledgerhq/live-common/lib/types";

import { accountScreenSelector } from "../../../reducers/accounts";
import { TrackScreen } from "../../../analytics";
import colors from "../../../colors";
import { ScreenName } from "../../../const";
import PreventNativeBack from "../../../components/PreventNativeBack";
import ValidateSuccess from "../../../components/ValidateSuccess";

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
  const { account } = useSelector(accountScreenSelector(route));
  invariant(account, "account is required");

  const onClose = useCallback(() => {
    navigation.dangerouslyGetParent().pop();
  }, [navigation]);

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
      <TrackScreen category="NominateFlow" name="ValidationSuccess" />
      <PreventNativeBack />
      <ValidateSuccess
        onClose={onClose}
        onViewDetails={goToOperationDetails}
        title={
          <Trans i18nKey="polkadot.nominate.steps.validation.success.title" />
        }
        description={
          <Trans i18nKey="polkadot.nominate.steps.validation.success.description" />
        }
      />
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
