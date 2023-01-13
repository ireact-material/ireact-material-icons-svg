import * as React from "react";
import { Icon } from "antd";

// 合成svg
const Svg = (path) => (
  <svg width="1em" height="1em" fill="currentColor" viewBox="0 0 1024 1024">
    {path}
  </svg>
);

export default function createSvgIcon(path, displayName) {
  function Component(props, ref) {
    return <Icon component={Svg(path)} {...props} ref={ref} />;
  }

  if (process.env.NODE_ENV !== "production") {
    // Need to set `displayName` on the inner component for React.memo.
    // React prior to 16.14 ignores `displayName` on the wrapper.
    Component.displayName = `${displayName}Icon`;
  }

  return React.memo(React.forwardRef(Component));
}
