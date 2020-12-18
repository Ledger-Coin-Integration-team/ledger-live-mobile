// @flow
import React, { useState, useCallback } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import LText from "../../../components/LText";
import InfoModal from "../../../modals/Info";
import colors from "../../../colors";

type Props = {
  electionOpen?: boolean,
  disabled?: boolean,
  onPress: () => void,
};

export function NominateAction({ onPress, electionOpen, disabled }: Props) {
  const { t } = useTranslation();

  const [disabledModalOpen, setDisabledModalOpen] = useState(false);

  const onClick = useCallback(() => {
    if (disabled) setDisabledModalOpen(true);
    else onPress();
  }, [onPress, disabled]);

  const onCloseModal = useCallback(() => setDisabledModalOpen(false), []);

  return (
    <TouchableOpacity onPress={onClick}>
      <LText
        semiBold
        style={[styles.actionColor, disabled ? { color: colors.grey } : {}]}
      >
        {t("polkadot.nomination.nominate")}
      </LText>
      <InfoModal
        isOpened={!!disabledModalOpen}
        onClose={onCloseModal}
        data={[
          electionOpen
            ? {
                title: t("polkadot.info.electionOpen.title"),
                description: t("polkadot.info.electionOpen.description"),
              }
            : {
                title: t("polkadot.info.nominateDisabled.title"),
                description: t("polkadot.info.nominateDisabled.description"),
              },
        ]}
      />
    </TouchableOpacity>
  );
}

export function RebondAction({ onPress, disabled }: Props) {
  const { t } = useTranslation();

  const [disabledModalOpen, setDisabledModalOpen] = useState(false);

  const onClick = useCallback(() => {
    if (disabled) setDisabledModalOpen(true);
    else onPress();
  }, [onPress, disabled]);

  const onCloseModal = useCallback(() => setDisabledModalOpen(false), []);

  return (
    <TouchableOpacity onPress={onClick}>
      <LText
        semiBold
        style={[styles.actionColor, disabled ? { color: colors.grey } : {}]}
      >
        {t("polkadot.unlockings.rebond")}
      </LText>
      <InfoModal
        isOpened={!!disabledModalOpen}
        onClose={onCloseModal}
        data={[
          {
            title: t("polkadot.info.electionOpen.title"),
            description: t("polkadot.info.electionOpen.description"),
          },
        ]}
      />
    </TouchableOpacity>
  );
}

export function WithdrawAction({ onPress, disabled }: Props) {
  const { t } = useTranslation();

  const [disabledModalOpen, setDisabledModalOpen] = useState(false);

  const onClick = useCallback(() => {
    if (disabled) setDisabledModalOpen(true);
    else onPress();
  }, [onPress, disabled]);

  const onCloseModal = useCallback(() => setDisabledModalOpen(false), []);

  return (
    <TouchableOpacity onPress={onClick}>
      <LText
        semiBold
        style={[styles.actionColor, disabled ? { color: colors.grey } : {}]}
      >
        {t("polkadot.unlockings.withdrawUnbonded")}
      </LText>
      <InfoModal
        isOpened={!!disabledModalOpen}
        onClose={onCloseModal}
        data={[
          {
            title: t("polkadot.info.electionOpen.title"),
            description: t("polkadot.info.electionOpen.description"),
          },
        ]}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: {
    padding: 16,
  },
  illustration: { alignSelf: "center", marginBottom: 16 },
  actionColor: {
    color: colors.live,
  },
});
