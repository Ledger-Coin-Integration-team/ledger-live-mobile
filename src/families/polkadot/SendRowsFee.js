// @flow
import React, { useCallback } from "react";
import { View, StyleSheet, Linking } from "react-native";
import type { AccountLike, Transaction } from "@ledgerhq/live-common/lib/types";
import { Trans } from "react-i18next";

import {
  getAccountUnit,
  getAccountCurrency,
} from "@ledgerhq/live-common/lib/account";
import SummaryRow from "../../screens/SendFunds/SummaryRow";
import LText from "../../components/LText";
import CurrencyUnitValue from "../../components/CurrencyUnitValue";
import CounterValue from "../../components/CounterValue";
import ExternalLink from "../../icons/ExternalLink";
import { urls } from "../../config/urls";
import colors from "../../colors";

type Props = {
  account: AccountLike,
  transaction: Transaction,
};

export default function PolkadotFeeRow({ account, transaction }: Props) {
  const extraInfoFees = useCallback(() => {
    Linking.openURL(urls.feesMoreInfo);
  }, []);

  const fees = transaction.fees ? transaction.fees : null;
  const unit = getAccountUnit(account);
  const currency = getAccountCurrency(account);

  return (
    <SummaryRow
      onPress={extraInfoFees}
      title={<Trans i18nKey="send.fees.title" />}
      additionalInfo={
        <View>
          <ExternalLink size={12} color={colors.grey} />
        </View>
      }
    >
      <View style={styles.wrapper}>
        <LText style={styles.valueText}>
          {fees ? <CurrencyUnitValue unit={unit} value={fees} /> : " "}
        </LText>
        <LText style={styles.countervalue}>
          {fees ? (
            <CounterValue before="≈ " value={fees} currency={currency} />
          ) : (
            " "
          )}
        </LText>
      </View>
    </SummaryRow>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "column",
    alignItems: "flex-end",
    flex: 1,
  },
  countervalue: {
    fontSize: 12,
    color: colors.grey,
  },
  valueText: {
    fontSize: 16,
  },
  link: {
    color: colors.live,
    textDecorationStyle: "solid",
    textDecorationLine: "underline",
    textDecorationColor: colors.live,
    marginLeft: 8,
  },
});
