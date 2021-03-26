// @flow
import invariant from "invariant";
import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, FlatList, Text } from "react-native";
import SafeAreaView from "react-native-safe-area-view";
import { useSelector } from "react-redux";
import { useTheme } from "@react-navigation/native";
import { Trans } from "react-i18next";

import type { PolkadotPendingReward } from "@ledgerhq/live-common/lib/families/polkadot/types";
import { getAccountBridge } from "@ledgerhq/live-common/lib/bridge";
import useBridgeTransaction from "@ledgerhq/live-common/lib/bridge/useBridgeTransaction";
import {
  getMainAccount,
  getAccountUnit,
} from "@ledgerhq/live-common/lib/account";

import { usePendingRewardsIdentities } from "@ledgerhq/live-common/lib/families/polkadot/react";
import { getPendingRewards } from "@ledgerhq/live-common/lib/families/polkadot/api";

import InfoBox from "../../../components/InfoBox";
import LText from "../../../components/LText";
import Spinning from "../../../components/Spinning";
import InfoIcon from "../../../icons/Info";
import LiveLogo from "../../../icons/LiveLogoIcon";

import { accountScreenSelector } from "../../../reducers/accounts";
import { ScreenName } from "../../../const";
import PendingRewardItem from "./PendingRewardItem";

type RouteParams = {
  accountId: string,
  transaction: Transaction,
};

type Props = {
  navigation: any,
  route: { params: RouteParams },
};

export default function SelectReward({ navigation, route }: Props) {
  const [rewardsLoading, setLoading] = useState(true);
  const [rewardsError, setError] = useState(null);
  const [pendingRewards, setPendingRewards] = useState([]);

  const { colors } = useTheme();
  const { account } = useSelector(accountScreenSelector(route));

  invariant(account, "account required");

  const mainAccount = getMainAccount(account, undefined);
  const bridge = getAccountBridge(account, undefined);

  const { transaction } = useBridgeTransaction(() => {
    const t = bridge.createTransaction(mainAccount);

    return {
      account,
      transaction: bridge.updateTransaction(t, {
        mode: "claimReward",
        validators: [],
        era: null,
      }),
    };
  });

  invariant(transaction, "transaction required");

  const unit = getAccountUnit(account);

  const address = account.freshAddress;

  useEffect(() => {
    if (!rewardsLoading || rewardsError) return;

    async function fetchPendingRewards() {
      try {
        const pr = await getPendingRewards(address);
        setPendingRewards(pr);
        setLoading(false);
      } catch (error) {
        // TODO: test network error
        setError(error);
      }
    }

    fetchPendingRewards();
  }, [address, rewardsLoading, rewardsError]);

  const onSelect = useCallback(
    (pendingReward: PolkadotPendingReward) => {
      const tx = bridge.updateTransaction(transaction, {
        validators: [pendingReward.validator.address],
        era: pendingReward.era,
      });

      navigation.navigate(ScreenName.PolkadotClaimRewardSelectDevice, {
        ...route.params,
        transaction: tx,
      });
    },
    [navigation, route.params, bridge, transaction],
  );

  const renderItem = useCallback(
    ({ item }) => (
      <PendingRewardItem item={item} unit={unit} onSelect={onSelect} />
    ),
    [unit, onSelect],
  );

  const pendingRewardsWithIdentities = usePendingRewardsIdentities(
    pendingRewards,
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      <InfoBox>
        <Trans i18nKey="polkadot.claimReward.steps.selectReward.info" />
      </InfoBox>
      <View style={styles.main}>
        {rewardsLoading ? (
          <View style={styles.loading}>
            <Spinning>
              <LiveLogo size={32} color={colors.grey} />
            </Spinning>
            <LText style={styles.textCenter}>
              <Trans i18nKey="polkadot.claimReward.steps.selectReward.loading.info"></Trans>
            </LText>
            <LText style={styles.textCenter}>
              <Trans i18nKey="polkadot.claimReward.steps.selectReward.loading.description"></Trans>
            </LText>
          </View>
        ) : !pendingRewards.length ? (
          <View style={styles.noResult}>
            <InfoIcon size={32} color={colors.grey} />
            <LText style={styles.textCenter}>
              <Trans i18nKey="polkadot.claimReward.steps.selectReward.noResults"></Trans>
            </LText>
          </View>
        ) : (
          <FlatList
            style={styles.list}
            keyExtractor={pr => `${pr.validator.address}_${pr.era}`}
            data={pendingRewardsWithIdentities}
            renderItem={renderItem}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  main: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  noResult: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  list: { width: "100%" },
  textCenter: { textAlign: "center" },
});
