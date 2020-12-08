// @flow

import React from "react";
import { useTranslation } from "react-i18next";
import { createStackNavigator } from "@react-navigation/stack";
import { ScreenName } from "../../../const";
import { closableStackNavigatorConfig } from "../../../navigation/navigatorConfig";
import StepHeader from "../../../components/StepHeader";

import Amount from "./01-Amount";
import SelectDevice from "../../../screens/SelectDevice";
import ConnectDevice from "../../../screens/ConnectDevice";
import ValidationSuccess from "./03-ValidationSuccess";
import ValidationError from "./03-ValidationError";

const totalSteps = "3";

function UnbondFlow() {
  const { t } = useTranslation();

  return (
    <Stack.Navigator screenOptions={closableStackNavigatorConfig}>
      <Stack.Screen
        name={ScreenName.PolkadotUnbondAmount}
        component={Amount}
        options={{
          headerTitle: () => (
            <StepHeader
              title={t("polkadot.unbond.stepperHeader.amount")}
              subtitle={t("polkadot.unbond.stepperHeader.stepRange", {
                currentStep: "1",
                totalSteps,
              })}
            />
          ),
          headerLeft: null,
        }}
      />
      <Stack.Screen
        name={ScreenName.PolkadotUnbondSelectDevice}
        component={SelectDevice}
        options={{
          headerTitle: () => (
            <StepHeader
              title={t("polkadot.unbond.stepperHeader.selectDevice")}
              subtitle={t("polkadot.unbond.stepperHeader.stepRange", {
                currentStep: "2",
                totalSteps,
              })}
            />
          ),
        }}
      />
      <Stack.Screen
        name={ScreenName.PolkadotUnbondConnectDevice}
        component={ConnectDevice}
        options={{
          headerTitle: () => (
            <StepHeader
              title={t("polkadot.unbond.stepperHeader.connectDevice")}
              subtitle={t("polkadot.unbond.stepperHeader.stepRange", {
                currentStep: "3",
                totalSteps,
              })}
            />
          ),
        }}
      />
      <Stack.Screen
        name={ScreenName.PolkadotUnbondValidationSuccess}
        component={ValidationSuccess}
        options={{
          headerTitle: null,
          gestureEnabled: false,
          headerLeft: null,
          headerRight: null,
        }}
      />
      <Stack.Screen
        name={ScreenName.PolkadotUnbondValidationError}
        component={ValidationError}
        options={{ headerTitle: null }}
      />
    </Stack.Navigator>
  );
}

const options = {
  headerShown: false,
};

export { UnbondFlow as component, options };

const Stack = createStackNavigator();
