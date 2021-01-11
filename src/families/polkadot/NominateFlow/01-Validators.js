// @flow
import invariant from "invariant";
import React, { useCallback, useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SectionList,
  Linking,
} from "react-native";

import SafeAreaView from "react-native-safe-area-view";
import { Trans } from "react-i18next";
import { useSelector } from "react-redux";

import type { Transaction } from "@ledgerhq/live-common/lib/families/polkadot/types";

import { getAccountBridge } from "@ledgerhq/live-common/lib/bridge";
import { getMainAccount } from "@ledgerhq/live-common/lib/account";
import {
  getDefaultExplorerView,
  getAddressExplorer,
} from "@ledgerhq/live-common/lib/explorers";
import useBridgeTransaction from "@ledgerhq/live-common/lib/bridge/useBridgeTransaction";
import { MAX_NOMINATIONS } from "@ledgerhq/live-common/lib/families/polkadot/logic";
import { PolkadotValidatorsRequired } from "@ledgerhq/live-common/lib/families/polkadot/errors";

import {
  usePolkadotPreloadData,
  useSortedValidators,
} from "@ledgerhq/live-common/lib/families/polkadot/react";

import { accountScreenSelector } from "../../../reducers/accounts";
import colors from "../../../colors";
import { NavigatorName, ScreenName } from "../../../const";
import Button from "../../../components/Button";
import SelectValidatorSearchBox from "../../tron/VoteFlow/01-SelectValidator/SearchBox";
import LText from "../../../components/LText";
import WarningBox from "../../../components/WarningBox";
import TranslatedError from "../../../components/TranslatedError";

import Check from "../../../icons/Check";
import SendRowsFee from "../SendRowsFee";
import ValidatorItem from "./ValidatorItem";

// returns the first error
function getStatusError(status, type = "errors"): ?Error {
  if (!status || !status[type]) return null;
  const firstKey = Object.keys(status[type])[0];

  return firstKey ? status[type][firstKey] : null;
}

type RouteParams = {
  accountId: string,
  transaction: Transaction,
  fromSelectAmount?: true,
};

type Props = {
  navigation: any,
  route: { params: RouteParams },
};

function NominateSelectValidator({ navigation, route }: Props) {
  const { account, parentAccount } = useSelector(accountScreenSelector(route));

  invariant(account, "account required");

  const mainAccount = getMainAccount(account, parentAccount);
  const bridge = getAccountBridge(account, parentAccount);

  const { polkadotResources } = mainAccount;

  invariant(polkadotResources, "polkadotResources required");

  const {
    transaction,
    setTransaction,
    status,
    bridgePending,
  } = useBridgeTransaction(() => {
    const tx = route.params.transaction;

    if (!tx) {
      const t = bridge.createTransaction(mainAccount);

      const initialValidators = (
        mainAccount.polkadotResources?.nominations || []
      )
        .filter(nomination => !!nomination.status)
        .map(nomination => nomination.address);

      return {
        account,
        transaction: bridge.updateTransaction(t, {
          mode: "nominate",
          validators: initialValidators,
        }),
      };
    }

    return { account, transaction: tx };
  });

  invariant(
    transaction && transaction.validators,
    "transaction and validators required",
  );

  const [searchQuery, setSearchQuery] = useState("");

  const validators = useMemo(() => transaction.validators || [], [
    transaction.validators,
  ]);

  const nominations = useMemo(() => polkadotResources.nominations || [], [
    polkadotResources.nominations,
  ]);

  // Addresses that are no longer validators
  const nonValidators = useMemo(
    () =>
      (polkadotResources.nominations || [])
        .filter(nomination => !nomination.status)
        .map(nomination => nomination.address),
    [polkadotResources.nominations],
  );

  const { validators: polkadotValidators } = usePolkadotPreloadData();
  const sorted = useSortedValidators(
    searchQuery,
    polkadotValidators,
    nominations,
  );

  const sections = useMemo(
    () =>
      sorted
        .reduce(
          (data, validator) => {
            const isNominated = nominations.some(
              n => n.address === validator.address,
            );
            if (isNominated) {
              data[0].data.push(validator);
            } else if (validator.isElected) {
              data[1].data.push(validator);
            } else {
              data[2].data.push(validator);
            }
            return data;
          },
          [
            {
              title: (
                <Trans i18nKey="polkadot.nominate.steps.validators.myNominations" />
              ),
              data: [],
            },
            {
              title: (
                <Trans i18nKey="polkadot.nominate.steps.validators.electedValidators" />
              ),
              data: [],
            },
            {
              title: (
                <Trans i18nKey="polkadot.nominate.steps.validators.waitingValidators" />
              ),
              data: [],
            },
          ],
        )
        .filter(({ data }) => data.length > 0),
    [sorted, nominations],
  );

  const onNext = useCallback(() => {
    navigation.navigate(ScreenName.PolkadotNominateSelectDevice, {
      ...route.params,
      transaction,
      status,
    });
  }, [navigation, route.params, transaction, status]);

  const onSelect = useCallback(
    (validator, selected) => {
      const newValidators = selected
        ? validators.filter(v => v !== validator.address)
        : [...validators, validator.address];
      const tx = bridge.updateTransaction(transaction, {
        validators: newValidators,
      });
      setTransaction(tx);
    },
    [bridge, setTransaction, transaction, validators],
  );

  const onOpenExplorer = useCallback(
    (address: string) => {
      const url = getAddressExplorer(
        getDefaultExplorerView(mainAccount.currency),
        address,
      );
      if (url) Linking.openURL(url);
    },
    [mainAccount.currency],
  );

  const onGoToChill = useCallback(() => {
    navigation.dangerouslyGetParent().pop();
    navigation.navigate(NavigatorName.PolkadotSimpleOperationFlow, {
      screen: ScreenName.PolkadotSimpleOperationStarted,
      params: { mode: "chill", accountId: mainAccount.id },
    });
  }, [navigation, mainAccount]);

  const renderItem = useCallback(
    ({ item }) => {
      const selected = validators.indexOf(item.address) > -1;

      const disabled = validators.length >= MAX_NOMINATIONS;

      return (
        <ValidatorItem
          item={item}
          disabled={disabled}
          selected={selected}
          onSelect={onSelect}
          onOpenExplorer={onOpenExplorer}
        />
      );
    },
    [validators, onSelect, onOpenExplorer],
  );

  const error = getStatusError(status, "errors");
  const warning = getStatusError(status, "warning");
  const maxSelected = validators.length === MAX_NOMINATIONS;
  const maybeChill = error instanceof PolkadotValidatorsRequired;
  const ignoreError =
    error instanceof PolkadotValidatorsRequired && !nominations.length; // Do not show error on first nominate

  return (
    <SafeAreaView style={styles.root}>
      {nonValidators.length ? (
        <WarningBox>
          <Trans
            i18nKey="polkadot.nominate.steps.validators.notValidatorsRemoved"
            values={{ count: nonValidators.length }}
          />
        </WarningBox>
      ) : null}
      <SelectValidatorSearchBox
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      {sections.length <= 0 && (
        <View style={styles.noResult}>
          <LText style={styles.textCenter}>
            <Trans
              i18nKey="polkadot.nominate.steps.validators.noResultsFound"
              values={{ search: searchQuery }}
            >
              <LText bold>{""}</LText>
            </Trans>
          </LText>
        </View>
      )}
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => item.address + index}
        renderItem={renderItem}
        stickySectionHeadersEnabled
        renderSectionHeader={({ section: { title } }) => (
          <LText style={styles.header}>{title}</LText>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.paddingBottom}>
          <View style={styles.labelContainer}>
            {!ignoreError && maybeChill ? (
              <TouchableOpacity onPress={onGoToChill}>
                <LText
                  semiBold
                  style={[styles.footerMessage, styles.actionColor]}
                >
                  <Trans i18nKey="polkadot.nominate.steps.validators.maybeChill" />
                </LText>
              </TouchableOpacity>
            ) : (
              <>
                {maxSelected && <Check size={12} color={colors.success} />}
                <LText
                  style={[
                    styles.footerMessage,
                    maxSelected && styles.success,
                    !ignoreError && warning && styles.warning,
                    !ignoreError && error && styles.error,
                  ]}
                >
                  {!ignoreError && (error || warning) ? (
                    <TranslatedError error={error || warning} />
                  ) : (
                    <Trans
                      i18nKey="polkadot.nominate.steps.validators.selected"
                      values={{
                        selected: validators.length,
                        total: MAX_NOMINATIONS,
                      }}
                    />
                  )}
                </LText>
              </>
            )}
          </View>
        </View>
        <SendRowsFee
          account={account}
          parentAccount={parentAccount}
          transaction={transaction}
        />
        <Button
          disabled={!!error || bridgePending}
          event="PolkadotNominateSelectValidatorsContinue"
          onPress={onNext}
          title={
            <Trans
              i18nKey={
                !bridgePending
                  ? "common.continue"
                  : "send.amount.loadingNetwork"
              }
            />
          }
          type="primary"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  noResult: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    height: 32,
    paddingHorizontal: 16,
    lineHeight: 32,
    fontSize: 14,
    backgroundColor: colors.lightFog,
    color: colors.grey,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.lightFog,
    padding: 16,
    backgroundColor: colors.white,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  footerMessage: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 12,
    paddingHorizontal: 6,
  },
  textCenter: { textAlign: "center" },
  error: {
    color: colors.alert,
  },
  warning: {
    color: colors.orange,
  },
  success: {
    color: colors.success,
  },
  paddingBottom: {
    paddingBottom: 8,
  },
  actionColor: {
    color: colors.live,
  },
});

export default NominateSelectValidator;
