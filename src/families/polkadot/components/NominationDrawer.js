// @flow
import React from "react";
import type { ComponentType } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { getAccountCurrency } from "@ledgerhq/live-common/lib/account";
import { getCurrencyColor } from "@ledgerhq/live-common/lib/currencies";
import type { AccountLike } from "@ledgerhq/live-common/lib/types";
// TODO move to component
import DelegatingContainer from "../../tezos/DelegatingContainer";
import Close from "../../../icons/Close";
import colors, { rgba } from "../../../colors";
import getWindowDimensions from "../../../logic/getWindowDimensions";
import BottomModal from "../../../components/BottomModal";
import Circle from "../../../components/Circle";
import Touchable from "../../../components/Touchable";
import LText from "../../../components/LText";
import CurrencyIcon from "../../../components/CurrencyIcon";
import IconHelp from "../../../icons/Info";

import { normalize } from "../../../helpers/normalizeSize";

const { height } = getWindowDimensions();

type Props = {
  isOpen: boolean,
  onClose: () => void,
  account: AccountLike,
  icon?: React$Node,
  ValidatorImage: ComponentType<{ size: number }>,
  data: FieldType[],
};

export default function NominationDrawer({
  isOpen,
  onClose,
  account,
  ValidatorImage,
  data,
  icon,
}: Props) {
  const currency = getAccountCurrency(account);
  const color = getCurrencyColor(currency);

  const iconWidth = normalize(64);

  return (
    <BottomModal
      id="InfoModal"
      style={styles.modal}
      isOpened={isOpen}
      onClose={onClose}
    >
      <View style={styles.root}>
        <Touchable
          event="NominationDetailsModalClose"
          onPress={onClose}
          style={styles.closeButton}
        >
          <Circle size={iconWidth / 2} bg={colors.lightFog}>
            <Close />
          </Circle>
        </Touchable>

        <DelegatingContainer
          left={
            icon || (
              <Circle size={iconWidth} bg={rgba(color, 0.2)}>
                <CurrencyIcon
                  size={iconWidth / 2}
                  currency={currency}
                  bg={"rgba(0,0,0,0)"}
                />
              </Circle>
            )
          }
          right={<ValidatorImage size={iconWidth} />}
        />

        <ScrollView
          style={styles.scrollSection}
          showsVerticalScrollIndicator={true}
        >
          {data.map((field, i) => (
            <DataField
              {...field}
              key={"data-" + i}
              isLast={i === data.length - 1}
            />
          ))}
        </ScrollView>
      </View>
    </BottomModal>
  );
}

type FieldType = {
  label: React$Node,
  info?: React$Node,
  infoType?: "info" | "warning",
  Component: React$Node,
};

type DataFieldProps = FieldType & {
  isLast: boolean,
};

function DataField({
  label,
  info,
  infoType,
  Component,
  isLast,
}: DataFieldProps) {
  return (
    <View style={[styles.row, isLast ? styles.lastRow : undefined]}>
      <View style={styles.rowWrapper}>
        <LText numberOfLines={1} semiBold style={styles.labelText}>
          {label}
        </LText>
        <View style={styles.valueWrapper}>{Component}</View>
      </View>
      {info ? (
        <View style={[styles.infoBox]}>
          <IconHelp
            color={infoType === "warning" ? colors.orange : colors.grey}
            size={16}
          />
          <LText
            style={[
              styles.infoContent,
              infoType === "warning" && styles.infoWarning,
            ]}
          >
            {info}
          </LText>
        </View>
      ) : null}
    </View>
  );
}

export const styles = StyleSheet.create({
  modal: {
    position: "relative",
  },
  root: {
    paddingTop: 8,
  },
  closeButton: {
    alignSelf: "flex-end",
    marginRight: 16,
  },
  scrollSection: {
    maxHeight: height - normalize(425),
    paddingHorizontal: 16,
  },
  rowWrapper: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  row: {
    borderBottomColor: colors.lightFog,
    borderBottomWidth: 1,
    paddingVertical: 16,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  labelText: {
    paddingRight: 8,
    fontSize: 14,
    color: colors.smoke,
  },
  valueWrapper: {
    width: "50%",
    alignItems: "flex-end",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  infoContent: {
    color: colors.grey,
    flex: 1,
    marginLeft: 10,
    alignItems: "center",
  },
  infoWarning: {
    color: colors.orange,
  },
});
