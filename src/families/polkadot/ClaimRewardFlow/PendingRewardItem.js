// @flow
import React, { memo, useCallback } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Trans } from "react-i18next";

import { Polkadot as PolkadotIdenticon } from "@polkadot/reactnative-identicon/icons";
import type { PolkadotPendingReward } from "@ledgerhq/live-common/lib/families/polkadot/types";
import type { Unit } from "@ledgerhq/live-common/lib/types";

import { useTheme } from "@react-navigation/native";
import LText from "../../../components/LText";
import CurrencyUnitValue from "../../../components/CurrencyUnitValue";
import ArrowRight from "../../../icons/ArrowRight";

type Props = {
  item: PolkadotPendingReward,
  unit: Unit,
  onSelect: (item: PolkadotPendingReward) => void,
};

function PendingRewardItem({ item, unit, onSelect }: Props) {
  const { colors } = useTheme();
  const { validator, era, amount } = item;

  const select = useCallback(() => onSelect(item), [onSelect, validator]);

  return (
    <TouchableOpacity onPress={select} style={[styles.wrapper]}>
      <View style={[styles.iconWrapper, { backgroundColor: colors.lightLive }]}>
        <PolkadotIdenticon address={validator.address} size={32} />
      </View>

      <View style={styles.nameWrapper}>
        <LText semiBold style={[styles.nameText]} numberOfLines={1}>
          {validator.identity || validator.address}
        </LText>

        <LText style={styles.subText} color="grey" numberOfLines={1}>
          <Trans i18nKey="polkadot.era" /> {era}
        </LText>
      </View>
      <View style={styles.value}>
        {!!amount && (
          <View style={styles.valueContainer}>
            <LText semiBold style={[styles.valueLabel]} color={"darkBlue"}>
              <CurrencyUnitValue value={amount} unit={unit} showCode={false} />
            </LText>
          </View>
        )}
        <ArrowRight size={16} color={colors.grey} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconWrapper: {
    height: 36,
    width: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,

    marginRight: 12,
  },
  nameWrapper: {
    flex: 1,
    paddingRight: 16,
  },
  nameText: {
    fontSize: 15,
  },
  subText: {
    fontSize: 13,
  },
  valueContainer: { alignItems: "flex-end" },
  value: { flexDirection: "row", alignItems: "center" },
  valueLabel: { paddingHorizontal: 8, fontSize: 16 },
});

export default memo<Props>(PendingRewardItem);
