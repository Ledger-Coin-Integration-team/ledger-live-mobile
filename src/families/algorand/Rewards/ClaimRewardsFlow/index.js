// @flow
import React from "react";
import { Platform } from "react-native";
import { useTranslation } from "react-i18next";
import { createStackNavigator } from "@react-navigation/stack";
import {
  closableStackNavigatorConfig,
  defaultNavigationOptions,
} from "../../../../navigation/navigatorConfig";
import StepHeader from "../../../../components/StepHeader";
import { ScreenName } from "../../../../const";
import ClaimRewardsInfo from "./01-Info";
import ClaimRewardsStarted from "./01-Started";
import ClaimRewardsConnectDevice from "./02-ConnectDevice";
import ClaimRewardsValidation from "./03-Validation";
import ClaimRewardsValidationError from "./03-ValidationError";
import ClaimRewardsValidationSuccess from "./03-ValidationSuccess";

function ClaimRewardsFlow() {
  const { t } = useTranslation();

  return (
    <Stack.Navigator
      screenOptions={{
        ...closableStackNavigatorConfig,
        gestureEnabled: Platform.OS === "ios",
      }}
    >
      <Stack.Screen
        name={ScreenName.AlgorandClaimRewardsStarted}
        component={ClaimRewardsStarted}
        options={{
          headerTitle: () => (
            <StepHeader
              title={t("algorand.claimRewards.stepperHeader.starter")}
              subtitle={t("algorand.claimRewards.stepperHeader.stepRange", {
                currentStep: "1",
                totalSteps: "3",
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
        name={ScreenName.AlgorandClaimRewardsConnectDevice}
        component={ClaimRewardsConnectDevice}
        options={{
          headerTitle: () => (
            <StepHeader
              title={t("algorand.claimRewards.stepperHeader.connectDevice")}
              subtitle={t("algorand.claimRewards.stepperHeader.stepRange", {
                currentStep: "2",
                totalSteps: "3",
              })}
            />
          ),
        }}
      />
      <Stack.Screen
        name={ScreenName.AlgorandClaimRewardsValidation}
        component={ClaimRewardsValidation}
        options={{
          headerTitle: () => (
            <StepHeader
              title={t("algorand.claimRewards.stepperHeader.verification")}
              subtitle={t("algorand.claimRewards.stepperHeader.stepRange", {
                currentStep: "3",
                totalSteps: "3",
              })}
            />
          ),
          headerLeft: null,
          headerRight: null,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name={ScreenName.AlgorandClaimRewardsValidationError}
        component={ClaimRewardsValidationError}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name={ScreenName.AlgorandClaimRewardsValidationSuccess}
        component={ClaimRewardsValidationSuccess}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name={ScreenName.AlgorandClaimRewardsInfo}
        component={ClaimRewardsInfo}
        options={{
          headerTitle: () => (
            <StepHeader title={t("algorand.claimRewards.stepperHeader.info")} />
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
    </Stack.Navigator>
  );
}

const options = {
  headerShown: false,
};

export { ClaimRewardsFlow as component, options };

const Stack = createStackNavigator();
