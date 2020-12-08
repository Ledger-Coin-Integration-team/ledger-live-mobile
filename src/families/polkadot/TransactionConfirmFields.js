// @flow
import React, { useMemo, useCallback } from "react";
import { Linking } from "react-native";

import type { Account } from "@ledgerhq/live-common/lib/types";
import type { Transaction } from "@ledgerhq/live-common/lib/families/polkadot/types";
import { usePolkadotPreloadData } from "@ledgerhq/live-common/lib/families/polkadot/react";
import {
  getDefaultExplorerView,
  getAddressExplorer,
} from "@ledgerhq/live-common/lib/explorers";

import { HeaderRow } from "../../components/ValidateOnDeviceDataRow";

import NominationInfo from "./components/NominationInfo";

type FieldProps = {
  account: Account,
  transaction: Transaction,
  field: {
    type: string,
    label: string,
  },
};

function PolkadotValidatorsField({ account, transaction, field }: FieldProps) {
  const { validators: polkadotValidators } = usePolkadotPreloadData();

  const validators = transaction.validators;

  const mappedValidators = useMemo(
    () =>
      (validators || [])
        .map(address => polkadotValidators.find(v => v.address === address))
        .filter(Boolean),
    [validators, polkadotValidators],
  );

  const redirectAddressCreator = useCallback(
    address => () => {
      const url = getAddressExplorer(
        getDefaultExplorerView(account.currency),
        address,
      );
      if (url) Linking.openURL(url);
    },
    [account],
  );

  return (
    <>
      <HeaderRow label={field.label} value={""} />

      {mappedValidators &&
        mappedValidators.map(({ address, identity }, i) => (
          <NominationInfo
            key={address + i}
            address={address}
            identity={identity}
            onPress={redirectAddressCreator(address)}
          />
        ))}
    </>
  );
}

const fieldComponents = {
  "polkadot.validators": PolkadotValidatorsField,
};

export default {
  fieldComponents,
};
