import * as React from "react";

const VisuallyHidden = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ ...props }, ref) => {
  return (
    <span
      ref={ref}
      style={{
        position: "absolute",
        border: 0,
        width: "1px",
        height: "1px",
        padding: 0,
        margin: "-1px",
        overflow: "hidden",
        clip: "rect(0, 0, 0, 0)",
        whiteSpace: "nowrap",
        wordWrap: "normal",
      }}
      {...props}
    />
  );
});
VisuallyHidden.displayName = "VisuallyHidden";

export { VisuallyHidden };
