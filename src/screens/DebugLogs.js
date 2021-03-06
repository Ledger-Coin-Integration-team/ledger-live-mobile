// @flow
import React, { useEffect, useCallback, useState } from "react";
import { listen } from "@ledgerhq/logs";
import { ScrollView, View, StyleSheet } from "react-native";
import Share from "react-native-share";
import logger from "../logger";
import logReport from "../log-report";
import Button from "../components/Button";
import LText from "../components/LText";

export default function DebugLogs() {
  const [logs, setLogs] = useState([]);
  const prependToLogs = useCallback(
    log => setLogs(currentLogs => [log, ...currentLogs]),
    [],
  );

  useEffect(() => listen(prependToLogs), [prependToLogs]);
  const onExport = async () => {
    const message = JSON.stringify(logs);
    const base64 = Buffer.from(message).toString("base64");

    const options = {
      failOnCancel: false,
      saveToFiles: true,
      type: "application/json",
      filename: "logs",
      url: `data:application/json;base64,${base64}`,
    };

    try {
      await Share.open(options);
    } catch (err) {
      // `failOnCancel: false` is not enough to prevent throwing on cancel apparently ¯\_(ツ)_/¯
      if (err.error.code !== "ECANCELLED500") {
        logger.critical(err);
      }
    }
  };

  const onDisplayLatestLogs = () => {
    const logs = logReport.getLogs();
    alert(logs.map(log => JSON.stringify(log)).join("\n"));
  };

  return (
    <View style={styles.wrapper}>
      <Button
        event="ConfirmationModalCancel"
        type="primary"
        containerStyle={styles.button}
        title={"Export logs"}
        onPress={onExport}
      />
      <Button
        type="primary"
        containerStyle={styles.button}
        title={"Display latest logs"}
        onPress={onDisplayLatestLogs}
      />
      <ScrollView>
        <View>
          {logs.map((log, index) => (
            <LText color="text" key={index}>
              {JSON.stringify(log)}
            </LText>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    padding: 20,
  },
  button: {
    marginBottom: 20,
  },
});
