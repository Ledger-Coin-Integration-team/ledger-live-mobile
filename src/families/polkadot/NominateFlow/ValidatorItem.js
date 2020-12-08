// @flow
import React, { memo, useCallback, useMemo } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Trans } from "react-i18next";

import type { PolkadotValidator } from "@ledgerhq/live-common/lib/families/polkadot/types";

import colors from "../../../colors";
import CheckBox from "../../../components/CheckBox";
import LText from "../../../components/LText";
import FirstLetterIcon from "../../../components/FirstLetterIcon";
import Touchable from "../../../components/Touchable";

type Props = {
  item: PolkadotValidator,
  disabled: boolean,
  onSelect: (item: PolkadotValidator, selected: boolean) => void,
  onOpenExplorer: (address: string) => void,
  selected: boolean,
};

function Item({ item, selected, disabled, onSelect, onOpenExplorer }: Props) {
  const {
    identity,
    address,
    commission,
    nominatorsCount,
    isOversubscribed,
    isElected,
  } = item;

  const onPress = useCallback(() => onSelect(item, selected), [
    onSelect,
    item,
    selected,
  ]);

  const isDisabled = disabled && !selected;

  const formattedCommission = useMemo(
    () => (commission ? `${commission.multipliedBy(100).toNumber()} %` : "-"),
    [commission],
  );
  return (
    <View style={[styles.wrapper, disabled ? styles.disabledWrapper : {}]}>
      <Touchable
        style={[styles.iconWrapper]}
        onPress={() => onOpenExplorer(address)}
        event="PolkadotNominateSelectValidatorsOpenExplorer"
      >
        <FirstLetterIcon
          style={isDisabled ? styles.disabledWrapper : {}}
          label={identity || address || ""}
        />
      </Touchable>

      <View style={styles.nameWrapper}>
        <Touchable
          onPress={() => onOpenExplorer(address)}
          event="PolkadotNominateSelectValidatorsOpenExplorer"
        >
          <LText
            semiBold
            style={[styles.nameText, isDisabled ? styles.disabledText : {}]}
            numberOfLines={1}
          >
            {identity || address || ""}
          </LText>
        </Touchable>

        {isElected ? (
          <LText
            style={[
              styles.valueLabel,
              isOversubscribed && styles.oversubscribed,
            ]}
          >
            {isOversubscribed ? (
              <Trans
                i18nKey="polkadot.nomination.oversubscribed"
                values={{ nominatorsCount }}
              />
            ) : (
              <Trans
                i18nKey="polkadot.nomination.nominatorsCount"
                values={{ nominatorsCount }}
              />
            )}
          </LText>
        ) : (
          <LText style={styles.valueLabel}>
            <Trans i18nKey="polkadot.nomination.waiting" />
          </LText>
        )}
      </View>

      <View style={styles.valueWrapper}>
        <LText semiBold style={styles.valueText}>
          {formattedCommission}
        </LText>

        <LText style={styles.valueLabel}>
          <Trans i18nKey="polkadot.nomination.commission" />
        </LText>
      </View>

      <TouchableOpacity onPress={onPress} disabled={isDisabled}>
        <CheckBox isChecked={selected} disabled={disabled} />
      </TouchableOpacity>
    </View>
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
    backgroundColor: colors.lightLive,
    marginRight: 12,
  },
  nameWrapper: {
    flexDirection: "column",
    flex: 1,
    paddingRight: 16,
  },
  nameText: {
    fontSize: 15,
    color: colors.live,
  },
  disabledWrapper: {
    backgroundColor: colors.lightGrey,
  },
  disabledText: {
    color: colors.grey,
  },
  valueWrapper: {
    alignItems: "flex-end",
    marginRight: 8,
  },
  valueText: {
    fontSize: 14,
  },
  valueLabel: {
    fontSize: 13,
    color: colors.grey,
  },
  oversubscribed: {
    color: colors.orange,
  },
});

export default memo<Props>(Item);
