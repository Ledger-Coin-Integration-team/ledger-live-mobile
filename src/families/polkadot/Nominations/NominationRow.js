// @flow
import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import type {
  PolkadotNomination,
  PolkadotValidator,
} from "@ledgerhq/live-common/lib/families/polkadot/types";
import type { Account } from "@ledgerhq/live-common/lib/types";
import {
  getAccountCurrency,
  getAccountUnit,
} from "@ledgerhq/live-common/lib/account";

import CurrencyUnitValue from "../../../components/CurrencyUnitValue";
import CounterValue from "../../../components/CounterValue";
import colors from "../../../colors";
import LText from "../../../components/LText";
import FirstLetterIcon from "../../../components/FirstLetterIcon";
import ArrowRight from "../../../icons/ArrowRight";

type Props = {
  nomination: PolkadotNomination,
  validator: ?PolkadotValidator,
  account: Account,
  onPress: (nomination: PolkadotNomination) => void,
  isLast?: boolean,
};

export default function NominationRow({
  nomination,
  validator,
  account,
  onPress,
  isLast = false,
}: Props) {
  const { t } = useTranslation();

  const { value, address, status } = nomination;
  const name = validator?.identity || address;
  // const total = validator?.totalBonded ?? null;
  // const commission = validator?.commission ?? null;

  const unit = getAccountUnit(account);
  const currency = getAccountCurrency(account);

  return (
    <TouchableOpacity
      style={[
        styles.row,
        styles.wrapper,
        !isLast ? styles.borderBottom : undefined,
      ]}
      onPress={() => onPress(nomination)}
    >
      <View style={styles.icon}>
        <FirstLetterIcon label={name} />
      </View>

      <View style={styles.nameWrapper}>
        <LText semiBold numberOfLines={1}>
          {name}
        </LText>

        <View style={styles.statusWrapper}>
          {status === "active" && (
            <LText style={styles.statusActive} numberOfLines={1}>
              {t("polkadot.nomination.active")}
            </LText>
          )}
          {status === "inactive" && (
            <LText style={styles.statusInactive} numberOfLines={1}>
              {t("polkadot.nomination.inactive")}
            </LText>
          )}
          {status === "waiting" && (
            <LText style={styles.statusWaiting} numberOfLines={1}>
              {t("polkadot.nomination.waiting")}
            </LText>
          )}
          <View style={styles.seeMore}>
            <LText style={styles.seeMoreText}>{t("common.seeMore")}</LText>
            <ArrowRight color={colors.live} size={14} />
          </View>
        </View>
      </View>

      {status !== "waiting" ? (
        <View style={styles.rightWrapper}>
          <LText semiBold>
            {" "}
            <CurrencyUnitValue value={value} unit={unit} />
          </LText>

          <LText style={styles.counterValue}>
            <CounterValue
              currency={currency}
              showCode
              value={value}
              alwaysShowSign={false}
              withPlaceholder
            />
          </LText>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    padding: 16,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGrey,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    borderRadius: 5,
    backgroundColor: colors.lightLive,
    marginRight: 12,
  },
  nameWrapper: {
    flex: 1,
    marginRight: 8,
  },
  statusWrapper: {
    flex: 1,
    marginRight: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  counterValue: { color: colors.grey },
  rightWrapper: {
    alignItems: "flex-end",
  },
  statusActive: {
    color: colors.success,
  },
  statusInactive: {
    color: colors.grey,
  },
  statusWaiting: {
    color: colors.grey,
  },
  seeMore: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
    paddingLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: colors.grey,
  },
  seeMoreText: {
    fontSize: 14,
    color: colors.live,
    textAlignVertical: "top",
  },
});
