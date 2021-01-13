import React from "react";
import { View, StyleSheet } from "react-native";

import {
  getAccountCurrency,
  getAccountUnit,
} from "@ledgerhq/live-common/lib/account";

import colors from "../../../colors";
import Touchable from "../../../components/Touchable";
import LText from "../../../components/LText";
import CurrencyUnitValue from "../../../components/CurrencyUnitValue";
import CounterValue from "../../../components/CounterValue";
import ExternalLink from "../../../icons/ExternalLink";

import NominationDrawer from "../components/NominationDrawer";

type NominationDrawerData = $PropertyType<
  ElementProps<typeof NominationDrawer>,
  "data",
>;

export function getDrawerInfo({
  t,
  account,
  nomination,
  validator,
  onOpenExplorer,
}): NominationDrawerData {
  const currency = getAccountCurrency(account);
  const unit = getAccountUnit(account);

  const amount = nomination.value;
  const totalStake = validator?.totalBonded;
  const formattedCommission = validator?.commission
    ? `${validator?.commission.multipliedBy(100).toFixed(2)} %`
    : "-";

  return [
    ...(validator?.identity
      ? [
          {
            label: t("delegation.validator"),
            Component: (
              <LText
                numberOfLines={1}
                semiBold
                ellipsizeMode="middle"
                style={styles.valueText}
              >
                {validator?.identity}
              </LText>
            ),
          },
        ]
      : []),
    {
      label: t("delegation.validatorAddress"),
      Component: (
        <Touchable
          onPress={() => onOpenExplorer(nomination.address)}
          event="NominationOpenExplorer"
        >
          <LText
            numberOfLines={1}
            semiBold
            ellipsizeMode="middle"
            style={[styles.valueText, styles.valueTextTouchable]}
          >
            {nomination.address}
            <View style={styles.iconContainer}>
              <ExternalLink size={14} color={colors.live} />
            </View>
          </LText>
        </Touchable>
      ),
    },
    {
      label: t("polkadot.nomination.status"),
      info: t(`polkadot.nomination.${nomination.status || "notValidator"}Info`),
      infoType: nomination.status ? "info" : "warning",
      Component: (
        <LText
          numberOfLines={1}
          semiBold
          ellipsizeMode="middle"
          style={[
            styles.valueText,
            !nomination.status && styles.statusNotValidator,
            nomination.status === "active" && styles.statusActive,
            nomination.status === "inactive" && styles.statusInactive,
            nomination.status === "waiting" && styles.statusWaiting,
          ]}
        >
          {t(`polkadot.nomination.${nomination.status || "notValidator"}`)}
        </LText>
      ),
    },
    ...(nomination.status
      ? [
          {
            label: t("polkadot.nomination.commission"),
            Component: (
              <LText
                numberOfLines={1}
                semiBold
                ellipsizeMode="middle"
                style={styles.valueText}
              >
                {formattedCommission}
              </LText>
            ),
          },
        ]
      : []),
    ...(nomination.status === "active" || nomination.status === "inactive"
      ? [
          {
            label: t("polkadot.nomination.nominators"),
            Component: (
              <LText
                numberOfLines={1}
                semiBold
                ellipsizeMode="middle"
                style={[
                  styles.valueText,
                  validator?.isOversubscribed && styles.valueWarning,
                ]}
              >
                {validator?.isOversubscribed
                  ? t(`polkadot.nomination.oversubscribed`, {
                      nominatorsCount: validator?.nominatorsCount,
                    })
                  : t(`polkadot.nomination.nominatorsCount`, {
                      nominatorsCount: validator?.nominatorsCount,
                    })}
              </LText>
            ),
          },
          {
            label: t("polkadot.nomination.totalStake"),
            Component: (
              <LText
                numberOfLines={1}
                semiBold
                ellipsizeMode="middle"
                style={styles.valueText}
              >
                <View style={styles.column}>
                  <LText semiBold>
                    <CurrencyUnitValue value={totalStake} unit={unit} />
                  </LText>
                  {totalStake ? (
                    <LText style={styles.valueCounterValue}>
                      <CounterValue
                        currency={currency}
                        value={totalStake}
                        withPlaceholder
                      />
                    </LText>
                  ) : null}
                </View>
              </LText>
            ),
          },
          {
            label: t("polkadot.nomination.amount"),
            Component: (
              <LText
                numberOfLines={1}
                semiBold
                ellipsizeMode="middle"
                style={styles.valueText}
              >
                <View style={styles.column}>
                  <LText semiBold>
                    <CurrencyUnitValue value={amount} unit={unit} />
                  </LText>
                  <LText style={styles.valueCounterValue}>
                    <CounterValue
                      currency={currency}
                      value={amount}
                      withPlaceholder
                    />
                  </LText>
                </View>
              </LText>
            ),
          },
        ]
      : []),
  ];
}

const styles = StyleSheet.create({
  column: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  valueText: {
    fontSize: 14,
  },
  valueWarning: {
    color: colors.orange,
  },
  valueCounterValue: {
    fontSize: 14,
    color: colors.grey,
    flex: 1,
  },
  valueTextTouchable: {
    color: colors.live,
  },
  statusNotValidator: {
    color: colors.orange,
  },
  statusActive: {
    color: colors.success,
  },
  statusInactive: {},
  statusWaiting: {},
  iconContainer: {
    paddingLeft: 6,
  },
});
