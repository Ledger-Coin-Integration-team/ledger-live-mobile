// @flow
import isAfter from "date-fns/isAfter";

import React, { useCallback, useState, useMemo } from "react";
import { View, StyleSheet, Linking } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

import { getMainAccount } from "@ledgerhq/live-common/lib/account";
import {
  getDefaultExplorerView,
  getAddressExplorer,
} from "@ledgerhq/live-common/lib/explorers";
import type { Account } from "@ledgerhq/live-common/lib/types";
import {
  canNominate,
  isStash,
} from "@ledgerhq/live-common/lib/families/polkadot/logic";
import { usePolkadotPreloadData } from "@ledgerhq/live-common/lib/families/polkadot/react";
import type { PolkadotNomination } from "@ledgerhq/live-common/lib/families/polkadot/types";

import colors from "../../../colors";
import { ScreenName, NavigatorName } from "../../../const";
import AccountDelegationInfo from "../../../components/AccountDelegationInfo";
import IlluRewards from "../../../icons/images/Rewards";
import { urls } from "../../../config/urls";
import AccountSectionLabel from "../../../components/AccountSectionLabel";
import FirstLetterIcon from "../../../components/FirstLetterIcon";
import WarningBox from "../../../components/WarningBox";

import NominationDrawer from "../components/NominationDrawer";
import { NominateAction, RebondAction } from "./Actions";
import { getDrawerInfo } from "./drawerInfo";
import NominationRow from "./NominationRow";
import UnlockingRow from "./UnlockingRow";

type Props = {
  account: Account,
};

export default function Nominations({ account }: Props) {
  const { t } = useTranslation();
  const mainAccount = getMainAccount(account);

  const navigation = useNavigation();

  const { staking, validators } = usePolkadotPreloadData();

  const { polkadotResources } = mainAccount;

  const { lockedBalance, unlockedBalance, nominations, unlockings } =
    polkadotResources || {};

  const [nomination, setNomination] = useState<?PolkadotNomination>();

  const mappedNominations = useMemo(() => {
    return nominations?.map(nomination => {
      const validator = validators.find(v => v.address === nomination.address);
      return {
        nomination,
        validator,
      };
    });
  }, [nominations, validators]);

  const mappedNomination = useMemo(() => {
    if (nomination) {
      const validator = validators.find(v => v.address === nomination.address);
      return {
        nomination,
        validator,
      };
    }
    return null;
  }, [nomination, validators]);

  const unlockingsWithoutUnlocked = useMemo(
    () =>
      unlockings?.filter(({ completionDate }) =>
        isAfter(completionDate, new Date(Date.now())),
      ) ?? [],
    [unlockings],
  );

  const onNavigate = useCallback(
    ({
      route,
      screen,
      params,
    }: {
      route: $Values<typeof NavigatorName> | $Values<typeof ScreenName>,
      screen?: $Values<typeof ScreenName>,
      params?: { [key: string]: any },
    }) => {
      setNomination();
      navigation.navigate(route, {
        screen,
        params: { ...params, accountId: account.id },
      });
    },
    [navigation, account.id],
  );

  const onEarnRewards = useCallback(() => {
    isStash(account)
      ? onNavigate({
          route: NavigatorName.PolkadotNominateFlow,
          screen: ScreenName.PolkadotNominateSelectValidators,
        })
      : onNavigate({
          route: NavigatorName.PolkadotBondFlow,
          screen: ScreenName.PolkadotBondStarted,
        });
  }, [account, onNavigate]);

  const onNominate = useCallback(() => {
    onNavigate({
      route: NavigatorName.PolkadotNominateFlow,
      screen: ScreenName.PolkadotNominateSelectValidators,
    });
  }, [onNavigate]);

  const onRebond = useCallback(() => {
    onNavigate({
      route: NavigatorName.PolkadotRebondFlow,
      screen: ScreenName.PolkadotRebondAmount,
    });
  }, [onNavigate]);

  const onWithdraw = useCallback(() => {
    onNavigate({
      route: NavigatorName.PolkadotSimpleOperationFlow,
      screen: ScreenName.PolkadotSimpleOperationStarted,
      params: {
        mode: "withdrawUnbonded",
      },
    });
  }, [onNavigate]);

  const onCloseDrawer = useCallback(() => {
    setNomination();
  }, []);

  const onOpenExplorer = useCallback(
    (address: string) => {
      const url = getAddressExplorer(
        getDefaultExplorerView(account.currency),
        address,
      );
      if (url) Linking.openURL(url);
    },
    [account.currency],
  );

  const drawerInfo = useMemo(
    () =>
      mappedNomination
        ? getDrawerInfo({
            t,
            account,
            onOpenExplorer,
            nomination: mappedNomination?.nomination,
            validator: mappedNomination?.validator,
          })
        : [],
    [mappedNomination, t, account, onOpenExplorer],
  );

  const electionOpen =
    staking?.electionClosed !== undefined ? !staking?.electionClosed : false;

  const hasBondedBalance = lockedBalance && lockedBalance.gt(0);
  const hasUnlockedBalance = unlockedBalance && unlockedBalance.gt(0);
  const hasNominations = nominations && nominations?.length > 0;
  const hasUnlockings = unlockings && unlockings.length > 0;

  const nominateEnabled = !electionOpen && canNominate(account);
  const rebondEnabled = !electionOpen && !!hasUnlockings;
  const withdrawEnabled = !electionOpen && hasUnlockedBalance;

  return (
    <View style={styles.root}>
      <NominationDrawer
        isOpen={drawerInfo && drawerInfo.length > 0}
        onClose={onCloseDrawer}
        account={account}
        ValidatorImage={({ size }) => (
          <FirstLetterIcon
            label={
              mappedNomination?.validator?.identity ||
              mappedNomination?.nomination.address ||
              ""
            }
            round
            size={size}
            fontSize={24}
          />
        )}
        data={drawerInfo}
      />
      {electionOpen && (
        <WarningBox>{t("polkadot.info.electionOpen.description")}</WarningBox>
      )}
      {!hasNominations ? (
        <AccountDelegationInfo
          title={t("polkadot.nomination.emptyState.title")}
          image={<IlluRewards style={styles.illustration} />}
          description={t("polkadot.nomination.emptyState.description", {
            name: account.currency.name,
          })}
          infoUrl={urls.polkadotStaking}
          infoTitle={t("polkadot.nomination.emptyState.info")}
          onPress={onEarnRewards}
          ctaTitle={
            hasBondedBalance
              ? t("polkadot.nomination.nominate")
              : t("polkadot.nomination.emptyState.cta")
          }
        />
      ) : (
        <View style={styles.wrapper}>
          <AccountSectionLabel
            name={t("polkadot.nomination.header")}
            RightComponent={
              <NominateAction
                disabled={!nominateEnabled}
                electionOpen={electionOpen}
                onPress={onNominate}
              />
            }
          />
          {mappedNominations?.map(({ nomination, validator }, i) => (
            <View key={nomination.address} style={styles.nominationsWrapper}>
              <NominationRow
                nomination={nomination}
                validator={validator}
                account={account}
                onPress={() => setNomination(nomination)}
                isLast={i === (mappedNominations?.length || 0) - 1}
              />
            </View>
          ))}
        </View>
      )}

      {hasUnlockings ? (
        <View style={styles.wrapper}>
          <AccountSectionLabel
            name={t("polkadot.unlockings.header")}
            RightComponent={
              <RebondAction disabled={!rebondEnabled} onPress={onRebond} />
            }
          />
          {hasUnlockedBalance ? (
            <View style={styles.nominationsWrapper}>
              <UnlockingRow
                amount={unlockedBalance}
                account={account}
                onWithdraw={onWithdraw}
                disabled={!withdrawEnabled}
                isLast={unlockingsWithoutUnlocked.length === 0}
              />
            </View>
          ) : null}
          {unlockingsWithoutUnlocked?.map((unlocking, i) => (
            <View key={`unlocking_${i}`} style={styles.nominationsWrapper}>
              <UnlockingRow
                amount={unlocking.amount}
                completionDate={unlocking.completionDate}
                account={account}
                isLast={i === unlockingsWithoutUnlocked.length - 1}
              />
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    margin: 16,
  },
  illustration: { alignSelf: "center", marginBottom: 16 },
  rewardsWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignContent: "center",
    padding: 16,
    marginBottom: 16,
    backgroundColor: colors.white,
    borderRadius: 4,
  },
  nominationsWrapper: {
    borderRadius: 4,
    backgroundColor: colors.white,
  },
  wrapper: {
    marginBottom: 16,
  },
});