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

function RebondFlow() {
  const { t } = useTranslation();

  return (
    <Stack.Navigator screenOptions={closableStackNavigatorConfig}>
      <Stack.Screen
        name={ScreenName.PolkadotRebondAmount}
        component={Amount}
        options={{
          headerTitle: () => (
            <StepHeader
              title={t("polkadot.rebond.stepperHeader.amount")}
              subtitle={t("polkadot.rebond.stepperHeader.stepRange", {
                currentStep: "1",
                totalSteps,
              })}
            />
          ),
          headerLeft: null,
        }}
      />
      <Stack.Screen
        name={ScreenName.PolkadotRebondSelectDevice}
        component={SelectDevice}
        options={{
          headerTitle: () => (
            <StepHeader
              title={t("polkadot.rebond.stepperHeader.selectDevice")}
              subtitle={t("polkadot.rebond.stepperHeader.stepRange", {
                currentStep: "2",
                totalSteps,
              })}
            />
          ),
        }}
      />
      <Stack.Screen
        name={ScreenName.PolkadotRebondConnectDevice}
        component={ConnectDevice}
        options={{
          headerTitle: () => (
            <StepHeader
              title={t("polkadot.rebond.stepperHeader.connectDevice")}
              subtitle={t("polkadot.rebond.stepperHeader.stepRange", {
                currentStep: "3",
                totalSteps,
              })}
            />
          ),
        }}
      />
      <Stack.Screen
        name={ScreenName.PolkadotRebondValidationSuccess}
        component={ValidationSuccess}
        options={{
          headerTitle: null,
          gestureEnabled: false,
          headerLeft: null,
          headerRight: null,
        }}
      />
      <Stack.Screen
        name={ScreenName.PolkadotRebondValidationError}
        component={ValidationError}
        options={{ headerTitle: null }}
      />
    </Stack.Navigator>
  );
}

const options = {
  headerShown: false,
};

export { RebondFlow as component, options };

const Stack = createStackNavigator();
