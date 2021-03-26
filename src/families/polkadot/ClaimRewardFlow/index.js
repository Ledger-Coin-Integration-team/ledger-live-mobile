// @flow
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { createStackNavigator } from "@react-navigation/stack";
import { useTheme } from "@react-navigation/native";
import {
  getStackNavigatorConfig,
  defaultNavigationOptions,
} from "../../../navigation/navigatorConfig";
import StepHeader from "../../../components/StepHeader";
import { ScreenName } from "../../../const";

import ClaimRewardSelect from "./01-SelectReward";
import ClaimRewardSelectDevice from "../../../screens/SelectDevice";
import ClaimRewardConnectDevice from "../../../screens/ConnectDevice";
import ClaimRewardValidationError from "./03-ValidationError";
import ClaimRewardValidationSuccess from "./03-ValidationSuccess";

function ClaimRewardFlow() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const stackNavigationConfig = useMemo(
    () => getStackNavigatorConfig(colors, true),
    [colors],
  );

  const totalSteps = "3";

  return (
    <Stack.Navigator screenOptions={stackNavigationConfig}>
      <Stack.Screen
        name={ScreenName.PolkadotClaimRewardSelect}
        component={ClaimRewardSelect}
        options={{
          headerTitle: () => (
            <StepHeader
              title={t("polkadot.claimReward.stepperHeader.select")}
              subtitle={t("polkadot.claimReward.stepperHeader.stepRange", {
                currentStep: "1",
                totalSteps,
              })}
            />
          ),
          headerLeft: () => null,
          headerStyle: {
            ...defaultNavigationOptions.headerStyle,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name={ScreenName.PolkadotClaimRewardSelectDevice}
        component={ClaimRewardSelectDevice}
        options={{
          headerTitle: () => (
            <StepHeader
              title={t("polkadot.claimReward.stepperHeader.selectDevice")}
              subtitle={t("polkadot.claimReward.stepperHeader.stepRange", {
                currentStep: "2",
                totalSteps,
              })}
            />
          ),
        }}
      />
      <Stack.Screen
        name={ScreenName.PolkadotClaimRewardConnectDevice}
        component={ClaimRewardConnectDevice}
        options={{
          headerTitle: () => (
            <StepHeader
              title={t("polkadot.claimReward.stepperHeader.connectDevice")}
              subtitle={t("polkadot.claimReward.stepperHeader.stepRange", {
                currentStep: "2",
                totalSteps,
              })}
            />
          ),
        }}
      />
      <Stack.Screen
        name={ScreenName.PolkadotClaimRewardValidationError}
        component={ClaimRewardValidationError}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name={ScreenName.PolkadotClaimRewardValidationSuccess}
        component={ClaimRewardValidationSuccess}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
}

const options = {
  headerShown: false,
};

export { ClaimRewardFlow as component, options };

const Stack = createStackNavigator();
