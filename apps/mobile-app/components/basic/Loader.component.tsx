import { Color } from "@repo/config";
import React from "react";
import { ActivityIndicator, View } from "react-native";

const Loader = () => (
  <View
    className="absolute inset-0 justify-center items-center bg-transparent z-[1000]"
    style={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }}
  >
    <ActivityIndicator size="large" color={Color.TextGreen} />
  </View>
);

export default Loader;
