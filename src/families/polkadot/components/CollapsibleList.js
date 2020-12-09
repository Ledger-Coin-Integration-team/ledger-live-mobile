// @flow
import React, { useState, useCallback } from "react";
import { View, StyleSheet, Platform } from "react-native";

import Icon from "react-native-vector-icons/dist/FontAwesome";

import colors from "../../../colors";
import Button from "../../../components/Button";

type Props = {
  children?: React$Node,
  uncollapsedItems: Array<any>,
  collapsedItems: Array<any>,
  renderItem: (item: any, index: number, isLast: boolean) => React$Node,
  renderShowMore: (collapsed: boolean) => React$Node,
};

const CollapsibleList = ({
  children,
  uncollapsedItems,
  collapsedItems,
  renderItem,
  renderShowMore,
}: Props) => {
  const [collapsed, setCollapsed] = useState(true);

  const toggleCollapsed = useCallback(() => {
    setCollapsed(collapsed => !collapsed);
  }, []);

  return (
    <>
      <View
        style={[
          styles.list,
          !!collapsedItems.length && collapsed && styles.elevated,
        ]}
      >
        {children}
        {uncollapsedItems.map((item, i) =>
          renderItem(item, i, collapsed && i === uncollapsedItems.length - 1),
        )}
        {collapsedItems.length !== 0 ? (
          <>
            <View style={[collapsed ? styles.hidden : styles.visible]}>
              {collapsedItems.map((item, i) =>
                renderItem(item, i, i === collapsedItems.length - 1),
              )}
            </View>
            <View style={styles.showMore}>
              <Button
                type="lightSecondary"
                event="CollapsedListShowMore"
                title={renderShowMore(collapsed)}
                IconRight={() => (
                  <View style={styles.buttonIcon}>
                    <Icon
                      color={colors.live}
                      name={collapsed ? "angle-down" : "angle-up"}
                      size={16}
                    />
                  </View>
                )}
                onPress={toggleCollapsed}
                size={13}
              />
            </View>
          </>
        ) : null}
      </View>
      {!!collapsed && collapsedItems.length ? (
        <View style={styles.showMoreIndicator} />
      ) : null}
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  list: {
    zIndex: 2,
    backgroundColor: colors.white,
    borderRadius: 4,
    ...Platform.select({
      android: {
        elevation: 1,
      },
      ios: {
        shadowColor: colors.black,
        shadowOpacity: 0.03,
        shadowRadius: 8,
        shadowOffset: {
          height: 4,
        },
      },
    }),
  },
  elevated: {
    elevation: 2,
  },
  visible: {
    display: "flex",
  },
  hidden: {
    display: "none",
  },
  showMoreIndicator: {
    zIndex: 1,
    height: 7,
    marginRight: 5,
    marginLeft: 5,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.lightGrey,
    ...Platform.select({
      android: {
        elevation: 1,
      },
      ios: {
        shadowColor: colors.black,
        shadowOpacity: 0.03,
        shadowRadius: 4,
        shadowOffset: {
          height: 2,
        },
      },
    }),
  },
  showMore: {
    borderTopWidth: 1,
    borderTopColor: colors.lightGrey,
  },
  buttonIcon: { paddingLeft: 6 },
});

export default React.memo<Props>(CollapsibleList);
