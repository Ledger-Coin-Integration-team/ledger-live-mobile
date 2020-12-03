// @flow
import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import colors from "../../../colors";
import LText from "../../../components/LText";

type Props = {
  address: string,
  identity: ?string,
  onPress: (address: string) => void,
};

export default function NominationInfo({ address, identity, onPress }: Props) {
  return (
    <View style={styles.wrapper}>
      {identity ? (
        <LText style={styles.greyText}>
          <LText semiBold style={styles.text}>
            {identity}
          </LText>
        </LText>
      ) : null}

      <TouchableOpacity onPress={() => onPress(address)}>
        <LText style={styles.greyText}>{address}</LText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderLeftWidth: 3,
    borderLeftColor: colors.fog,
    paddingLeft: 16,
    marginBottom: 24,
  },
  text: {
    color: colors.darkBlue,
  },
  greyText: { color: colors.grey },
});
