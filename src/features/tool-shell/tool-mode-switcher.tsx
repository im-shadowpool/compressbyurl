"use client";

import { useState } from "react";

import { MaterialSymbol } from "@/components/icons";
import { SegmentedControl } from "@/components/ui";

import { FileIntake } from "@/features/file-intake";
import { ImageUrlIntake } from "@/features/image-url";
import { WebsiteScanIntake } from "@/features/website-scan";

const modes = [
  {
    label: "Upload files",
    shortLabel: "Files",
    value: "upload",
    icon: <MaterialSymbol name="upload_file" size={20} />,
    title: "Drop your images here",
    description: "Choose JPG, PNG, WebP or static AVIF files from your device.",
    symbol: "add_photo_alternate",
    requiresInternet: false,
  },
  {
    label: "Image URL",
    shortLabel: "Image URL",
    value: "image-url",
    icon: <MaterialSymbol name="link" size={20} />,
    title: "Paste an image URL",
    description: "Bring in one public image, then optimize it locally in your browser.",
    symbol: "add_link",
    requiresInternet: true,
  },
  {
    label: "Website URL",
    shortLabel: "Website",
    value: "website-url",
    icon: <MaterialSymbol name="travel_explore" size={20} />,
    title: "Scan a webpage",
    description: "Find heavy images, select the useful ones and prepare replacements.",
    symbol: "search_insights",
    requiresInternet: true,
  },
] as const;

type ToolMode = (typeof modes)[number]["value"];

export function ToolModeSwitcher() {
  const [mode, setMode] = useState<ToolMode>("upload");
  const activeMode = modes.find((item) => item.value === mode) ?? modes[0];

  return (
    <div className="tool-shell" id="tool">
      <SegmentedControl
        className="tool-shell__modes"
        label="Choose image source"
        onValueChange={setMode}
        options={modes.map(({ icon, label, value }) => ({ icon, label, value }))}
        value={mode}
      />
      {activeMode.value === "upload" ? <FileIntake /> : null}
      {activeMode.value === "image-url" ? <ImageUrlIntake /> : null}
      {activeMode.value === "website-url" ? <WebsiteScanIntake /> : null}
      <div className="tool-shell__trust" id="privacy">
        <MaterialSymbol name="lock" size={20} />
        <span>Local files never leave your device.</span>
      </div>
    </div>
  );
}
