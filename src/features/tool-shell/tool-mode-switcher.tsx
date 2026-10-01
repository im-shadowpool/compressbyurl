"use client";

import { useMemo, useRef, useState } from "react";

import { MaterialSymbol } from "@/components/icons";
import { Button, SegmentedControl } from "@/components/ui";
import type { SeoToolPreset } from "@/config/seo-routes";
import {
  CompressionSettingsProvider,
  FileIntake,
  type InitialCompressionSettings,
} from "@/features/file-intake";
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
  const shellRef = useRef<HTMLDialogElement>(null);
  const [expanded, setExpanded] = useState(false);

  function focusWorkspace() {
    const shell = shellRef.current;
    if (!shell || shell.matches(":modal")) return;
    // Promote the same DOM tree to the top layer, preserving files and workers.
    shell.close();
    shell.showModal();
    shell
      .querySelector<HTMLElement>('[aria-checked="true"]')
      ?.focus({ preventScroll: true });
    setExpanded(true);
  }
  const initialSettings = useMemo<InitialCompressionSettings | undefined>(() => {
    if (mode === "website-url") {
      return {
        compressionMode: "quality",
        outputFormat: "webp",
        quality: 90,
      };
    }
    return preset && preset.sourceMode !== "website-url"
      ? {
          compressionMode: preset.compressionMode,
          outputFormat: preset.outputFormat,
          quality: preset.quality,
          targetPreset: preset.targetPreset,
        }
      : undefined;
  }, [mode, preset]);
  const featuredSettingsGroup =
    preset?.sourceMode === "upload" && preset.settingsPanel !== "default"
      ? preset.settingsPanel === "target-size"
        ? "quality"
        : preset.settingsPanel
      : undefined;

  return (
    <CompressionSettingsProvider initialSettings={initialSettings}>
      <dialog
        className="tool-shell"
        id="tool"
        ref={shellRef}
        open
        aria-label="Image optimization workspace"
        onClose={() => {
          const shell = shellRef.current;
          if (shell && !shell.open) {
            shell.show();
            setExpanded(false);
          }
        }}
        onChangeCapture={(event) => {
          const target = event.target;
          if (
            target instanceof HTMLInputElement &&
            target.type === "file" &&
            target.files?.length
          )
            focusWorkspace();
        }}
      >
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
        <CompressionSettingsMenu featuredGroup={featuredSettingsGroup} />
        <div
          className="tool-stage"
          tabIndex={0}
          role="region"
          aria-label="Image workspace"
        >
          <div className="tool-stage__panel" hidden={mode !== "upload"}>
            <FileIntake
              acceptedFormats={
                preset?.sourceMode === "upload" ? preset.acceptedFormats : undefined
              }
            />
          </div>
          <div className="tool-stage__panel" hidden={mode !== "image-url"}>
            <ImageUrlIntake onWorkspaceStart={focusWorkspace} />
          </div>
          <div className="tool-stage__panel" hidden={mode !== "website-url"}>
            <WebsiteScanIntake
              onWorkspaceStart={focusWorkspace}
              purpose={preset?.sourceMode === "website-url" ? preset.purpose : undefined}
            />
          </div>
        </div>
        <div className="tool-shell__trust">
          <MaterialSymbol name="lock" size={20} />
          <span>Local files never leave your device.</span>
          <Button
            size="small"
            variant="ghost"
            onClick={() => (expanded ? shellRef.current?.close() : focusWorkspace())}
            leadingIcon={
              <MaterialSymbol
                name={expanded ? "close_fullscreen" : "open_in_full"}
                size={20}
              />
            }
          >
            {expanded ? "Back to page" : "Expand workspace"}
          </Button>
        </div>
      </dialog>
    </CompressionSettingsProvider>
  );
}
