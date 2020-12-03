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

import FreezeIcon from "../../icons/Freeze";
import UnfreezeIcon from "../../icons/Unfreeze";
import VoteIcon from "../../icons/Vote";
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
      Icon: FreezeIcon,
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
      Icon: UnfreezeIcon,
    },
    {
      disabled: !nominationEnabled,
      navigationParams: [
        NavigatorName.PolkadotNominationFlow,
        {
          screen: ScreenName.PolkadotNominationSelectValidators,
          params: { accountId },
        },
      ],
      label: <Trans i18nKey="polkadot.manage.nominate.title" />,
      description: <Trans i18nKey="polkadot.manage.nominate.description" />,
      Icon: VoteIcon,
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
      Icon: VoteIcon,
    },
  ];
};

export default {
  getActions,
};
