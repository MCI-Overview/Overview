import {
  adjustToLuminance,
  adjustColorBrightness,
  seedToColor,
} from "../../../utils/colors";

import { styled } from "@mui/joy";
import { keyframes, css } from "@mui/system";
import { Button as BaseButton } from "@mui/base/Button";

const fadeInOut = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.75; }
`;

const MagicalButton = styled(BaseButton)(
  ({ theme, seed, blinking, issameproject, opacity, color }) => {
    const generatedColor = seedToColor(seed || "");
    const hoverColor = issameproject
      ? adjustToLuminance(
          adjustColorBrightness(color || generatedColor, 20),
          0.3
        )
      : theme.palette.mode === "dark"
      ? "#434D5B"
      : "#DAE2ED";

    return css`
      font-weight: 600;
      font-size: 0.875rem;
      line-height: 1.5;
      background-color: ${color || generatedColor};
      padding: 4px 8px;
      border-radius: 8px;
      border: 0;
      color: white;
      transition: all 150ms ease;
      pointer-events: "none";
      opacity: ${opacity || 1};
      box-shadow: 0 2px 1px
          ${theme.palette.mode === "dark"
            ? "rgba(0, 0, 0, 0.5)"
            : "rgba(45, 45, 60, 0.2)"},
        inset 0 0 1px ${color || generatedColor},
        inset 0 0 1px ${color || generatedColor};

      &:hover {
        background-color: ${hoverColor};
        box-shadow: 0 4px 8px
          ${theme.palette.mode === "dark"
            ? "rgba(0, 0, 0, 0.7)"
            : "rgba(45, 45, 60, 0.3)"};
      }

      ${blinking &&
      css`
        animation: ${fadeInOut} 1s infinite ease;
      `}

      ${!issameproject &&
      css`
        background-color: ${theme.palette.mode === "dark"
          ? "#434D5B"
          : "#DAE2ED"};
        color: ${theme.palette.mode === "dark" ? "#DAE2ED" : "#434D5B"};
        border: 0;
        cursor: default;
        box-shadow: none;
        transform: scale(1);
      `};
    `;
  }
);

export default MagicalButton;
