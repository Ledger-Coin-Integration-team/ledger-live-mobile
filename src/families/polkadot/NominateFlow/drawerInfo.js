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

import NominationDrawer from "../components/NominationDrawer";

type NominationDrawerData = $PropertyType<
  ElementProps<typeof NominationDrawer>,
  "data",
>;

export function getDrawerInfo({
  t,
  account,
  validator,
  maxNominatorRewardedPerValidator,
  onOpenExplorer,
}): NominationDrawerData {
  const currency = getAccountCurrency(account);
  const unit = getAccountUnit(account);

  const totalStake = validator.totalBonded;
  const formattedCommission = validator.commission
    ? `${validator.commission.multipliedBy(100).toFixed(2)} %`
    : "-";
  const validatorStatus = validator.isElected ? "elected" : "waiting";

  return [
    ...(validator.identity
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
                {validator.identity}
              </LText>
            ),
          },
        ]
      : []),
    {
      label: t("delegation.validatorAddress"),
      Component: (
        <Touchable
          onPress={() => onOpenExplorer(validator.address)}
          event="NominationOpenExplorer"
        >
          <LText
            numberOfLines={1}
            semiBold
            ellipsizeMode="middle"
            style={[styles.valueText, styles.valueTextTouchable]}
          >
            {validator.address}
          </LText>
        </Touchable>
      ),
    },
    {
      label: t("polkadot.nomination.status"),
      info: t(`polkadot.nomination.${validatorStatus}Info`),
      infoType: validator.isElected ? "info" : "warning",
      Component: (
        <LText
          numberOfLines={1}
          semiBold
          ellipsizeMode="middle"
          style={[
            styles.valueText,
            validator.isElected && styles.statusElected,
            !validator.isElected && styles.statusWaiting,
          ]}
        >
          {t(`polkadot.nomination.${validatorStatus}`)}
        </LText>
      ),
    },
    ...(validator.status
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
    ...(validator.isElected
      ? [
          {
            label: t("polkadot.nomination.nominators"),
            info: validator.isOversubscribed
              ? t("polkadot.nomination.oversubscribedInfo", {
                  maxNominatorRewardedPerValidator,
                })
              : t("polkadot.nomination.nominatorsInfo", {
                  count: validator.nominatorsCount,
                }),
            Component: (
              <LText
                numberOfLines={1}
                semiBold
                ellipsizeMode="middle"
                style={[
                  styles.valueText,
                  validator.isOversubscribed && styles.valueWarning,
                ]}
              >
                {validator.isOversubscribed
                  ? t("polkadot.nomination.oversubscribed", {
                      nominatorsCount: validator.nominatorsCount,
                    })
                  : t("polkadot.nomination.nominatorsCount", {
                      nominatorsCount: validator.nominatorsCount,
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
  statusElected: {
    color: colors.success,
  },
  statusWaiting: {},
});
