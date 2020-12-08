// @flow
import React from "react";
import { Trans } from "react-i18next";
import type { Account } from "@ledgerhq/live-common/lib/types";

import {
  canNominate,
  canBond,
  canUnbond,
} from "@ledgerhq/live-common/lib/families/polkadot/logic";
import { getCurrentPolkadotPreloadData } from "@ledgerhq/live-common/lib/families/polkadot/preload";

import BondIcon from "../../icons/Plus";
import UnbondIcon from "../../icons/Withdraw";
import WithdrawIcon from "../../icons/Receive";
import NominateIcon from "../../icons/Vote";
import ChillIcon from "../../icons/Undelegate";
import { NavigatorName, ScreenName } from "../../const";

const getActions = ({ account }: { account: Account }) => {
  if (!account.polkadotResources) return null;

  const { staking } = getCurrentPolkadotPreloadData();

  const accountId = account.id;

  const { nominations } = account.polkadotResources || {};

  const electionOpen =
    staking?.electionClosed !== undefined ? !staking?.electionClosed : false;

  const nominationEnabled = !electionOpen && canNominate(account);
  const chillEnabled =
    !electionOpen && canNominate(account) && nominations?.length;
  const bondingEnabled = !electionOpen && canBond(account);
  const unbondingEnabled = !electionOpen && canUnbond(account);

  return [
    {
      disabled: !bondingEnabled,
      navigationParams: [
        NavigatorName.PolkadotBondFlow,
        {
          screen: ScreenName.PolkadotBondAmount,
          params: { accountId },
        },
      ],
      label: <Trans i18nKey="polkadot.manage.bond.title" />,
      description: <Trans i18nKey="polkadot.manage.bond.description" />,
      Icon: BondIcon,
    },
    {
      disabled: !unbondingEnabled,
      navigationParams: [
        NavigatorName.PolkadotUnbondFlow,
        {
          screen: ScreenName.PolkadotUnbondAmount,
          params: { accountId },
        },
      ],
      label: <Trans i18nKey="polkadot.manage.unbond.title" />,
      description: <Trans i18nKey="polkadot.manage.unbond.description" />,
      Icon: UnbondIcon,
    },
    {
      disabled: !chillEnabled,
      navigationParams: [
        NavigatorName.PolkadotSimpleOperationFlow,
        {
          screen: ScreenName.PolkadotSimpleOperationStarted,
          params: { mode: "withdrawUnbonded", accountId },
        },
      ],
      label: <Trans i18nKey="polkadot.manage.withdrawUnbonded.title" />,
      description: (
        <Trans i18nKey="polkadot.manage.withdrawUnbonded.description" />
      ),
      Icon: WithdrawIcon,
    },
    {
      disabled: !nominationEnabled,
      navigationParams: [
        NavigatorName.PolkadotNominateFlow,
        {
          screen: ScreenName.PolkadotNominateSelectValidators,
          params: { accountId },
        },
      ],
      label: <Trans i18nKey="polkadot.manage.nominate.title" />,
      description: <Trans i18nKey="polkadot.manage.nominate.description" />,
      Icon: NominateIcon,
    },
    {
      disabled: !chillEnabled,
      navigationParams: [
        NavigatorName.PolkadotSimpleOperationFlow,
        {
          screen: ScreenName.PolkadotSimpleOperationStarted,
          params: { mode: "chill", accountId },
        },
      ],
      label: <Trans i18nKey="polkadot.manage.chill.title" />,
      description: <Trans i18nKey="polkadot.manage.chill.description" />,
      Icon: ChillIcon,
    },
  ];
};

export default {
  getActions,
};
