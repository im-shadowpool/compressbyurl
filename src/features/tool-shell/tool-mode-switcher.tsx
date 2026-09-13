"use client";

import { useMemo, useState } from "react";

import { MaterialSymbol } from "@/components/icons";
import { SegmentedControl } from "@/components/ui";
import type { SeoToolPreset } from "@/config/seo-routes";
import { CompressionSettingsProvider, FileIntake } from "@/features/file-intake";
import { ImageUrlIntake } from "@/features/image-url";
import { WebsiteScanIntake } from "@/features/website-scan";

import { CompressionSettingsMenu } from "./settings-menu";

const modes = [
  {
    label: "Upload files",
    shortLabel: "Files",
    value: "upload",
    icon: <MaterialSymbol name="upload_file" size={20} />,
  },
  {
    label: "Image URL",
    shortLabel: "Image URL",
    value: "image-url",
    icon: <MaterialSymbol name="link" size={20} />,
  },
  {
    label: "Website URL",
    shortLabel: "Website",
    value: "website-url",
    icon: <MaterialSymbol name="travel_explore" size={20} />,
  },
] as const;

type ToolMode = (typeof modes)[number]["value"];

interface ToolModeSwitcherProps {
  preset?: SeoToolPreset;
}

export function ToolModeSwitcher({ preset }: ToolModeSwitcherProps = {}) {
  const [mode, setMode] = useState<ToolMode>(preset?.sourceMode ?? "upload");
  const activeMode = modes.find((item) => item.value === mode) ?? modes[0];
  const initialSettings = useMemo(
    () =>
      preset && preset.sourceMode !== "website-url"
        ? {
            compressionPreset: preset.compressionPreset,
            outputFormat: preset.outputFormat,
          }
        : undefined,
    [preset],
  );
  const featuredSettingsGroup =
    preset?.sourceMode === "upload" && preset.settingsPanel !== "default"
      ? preset.settingsPanel === "target-size"
        ? "quality"
        : preset.settingsPanel
      : undefined;

  return (
    <CompressionSettingsProvider initialSettings={initialSettings}>
      <div className="tool-shell" id="tool">
        <CompressionSettingsMenu featuredGroup={featuredSettingsGroup} />
        <div className="tool-shell__modes-row">
          <SegmentedControl
            className="tool-shell__modes"
            label="Choose image source"
            onValueChange={setMode}
            options={modes.map(({ icon, label, shortLabel, value }) => ({
              icon,
              label,
              shortLabel,
              value,
            }))}
            value={mode}
          />
        </div>
        <div className="tool-stage" key={mode}>
          {activeMode.value === "upload" ? (
            <FileIntake
              acceptedFormats={
                preset?.sourceMode === "upload" ? preset.acceptedFormats : undefined
              }
            />
          ) : null}
          {activeMode.value === "image-url" ? <ImageUrlIntake /> : null}
          {activeMode.value === "website-url" ? (
            <WebsiteScanIntake
              purpose={preset?.sourceMode === "website-url" ? preset.purpose : undefined}
            />
          ) : null}
        </div>
        <div className="tool-shell__trust" id="privacy">
          <MaterialSymbol name="lock" size={20} />
          <span>Local files never leave your device.</span>
        </div>
      </div>
    </CompressionSettingsProvider>
  );
}
