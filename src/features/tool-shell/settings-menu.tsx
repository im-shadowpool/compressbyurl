"use client";

import Image from "next/image";
import {
  type MouseEvent,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { MaterialSymbol } from "@/components/icons";
import { Button, Input, SegmentedControl, Select, Slider, Switch } from "@/components/ui";
import {
  COMPRESSION_PRESETS,
  createOutputName,
  resolveOutputFormat,
} from "@/features/compression";
import {
  describeCompressionMode,
  describeOutputFormat,
  describeResize,
  useCompressionSettings,
  type CompressionMode,
  type ResizeMode,
  type TargetPreset,
} from "@/features/file-intake";
import { classNames } from "@/lib/class-names";

type SettingsGroupId = "preset" | "format" | "quality" | "resize" | "naming" | "metadata";

interface SettingsGroup {
  description: string;
  icon: string;
  id: SettingsGroupId;
  label: string;
}

const SETTINGS_GROUPS: readonly SettingsGroup[] = [
  {
    description: "Start from a use-case preset. Adjusting anything switches to custom.",
    icon: "bookmark",
    id: "preset",
    label: "Preset",
  },
  {
    description: "Pick the output format. Conversion happens locally in your browser.",
    icon: "swap_horiz",
    id: "format",
    label: "Format",
  },
  {
    description: "Control how aggressively images are reduced.",
    icon: "tune",
    id: "quality",
    label: "Quality",
  },
  {
    description: "Bound the output dimensions. Images are never enlarged.",
    icon: "photo_size_select_large",
    id: "resize",
    label: "Resize",
  },
  {
    description: "Rename outputs with prefixes, patterns and numbering.",
    icon: "drive_file_rename_outline",
    id: "naming",
    label: "Naming",
  },
  {
    description: "Decide whether camera and location details travel with your files.",
    icon: "shield",
    id: "metadata",
    label: "Metadata",
  },
];

function isGroupCustomized(
  id: SettingsGroupId,
  settings: ReturnType<typeof useCompressionSettings>,
) {
  if (id === "preset") return settings.activePreset !== "custom";
  if (id === "format") return settings.outputFormat !== "keep";
  if (id === "quality") return settings.compressionMode !== "smart";
  if (id === "resize") return settings.resizeEnabled;
  if (id === "naming") return settings.customNaming;
  return !settings.stripMetadata;
}

function PresetPanel() {
  const settings = useCompressionSettings();

  return (
    <div className="settings-panel">
      <Select
        hint="Choose a starting point, then adjust any setting."
        label="Use case"
        onValueChange={settings.applyPreset}
        options={[
          { label: "Custom settings", value: "custom" },
          ...COMPRESSION_PRESETS.map((preset) => ({
            label: preset.label,
            value: preset.id,
          })),
        ]}
        value={settings.activePreset}
      />
      {settings.selectedPreset ? (
        <p className="settings-panel__callout">{settings.selectedPreset.description}</p>
      ) : null}
      <div className="settings-panel__storage">
        <div>
          <strong>Saved on this device</strong>
          <span>
            Preferences stay in this browser. Files and image data are never saved.
          </span>
        </div>
        <Button size="small" variant="ghost" onClick={settings.resetSavedPreferences}>
          Reset settings
        </Button>
      </div>
      {settings.preferencesNotice ? (
        <p aria-live="polite" className="settings-panel__note" role="status">
          {settings.preferencesNotice}
        </p>
      ) : null}
    </div>
  );
}

function FormatPanel() {
  const settings = useCompressionSettings();
  const preview = settings.intakeSample.previewUrl;
  const hex = settings.jpegBackground.toUpperCase();

  return (
    <div className="settings-panel">
      <Select
        hint="Keep original preserves each file's format."
        label="Save as"
        onValueChange={settings.updateOutputFormat}
        options={[
          { label: "Keep original format", value: "keep" },
          { label: "JPEG", value: "jpeg" },
          { label: "PNG", value: "png" },
          { label: "WebP", value: "webp" },
          { label: "AVIF", value: "avif" },
        ]}
        value={settings.outputFormat}
      />
      {settings.outputFormat === "jpeg" ? (
        <div className="settings-panel__color">
          <label>
            <span>Transparency background</span>
            <span className="settings-panel__color-control">
              <input
                aria-label="JPEG background color"
                onInput={(event) =>
                  settings.updateJpegBackground(event.currentTarget.value)
                }
                type="color"
                value={settings.jpegBackground}
              />
              <output>{hex}</output>
            </span>
          </label>
          <div
            className="settings-panel__preview"
            style={{ backgroundColor: settings.jpegBackground }}
          >
            {preview ? (
              <Image alt="" height={72} src={preview} unoptimized width={72} />
            ) : (
              <MaterialSymbol name="image" size={24} />
            )}
          </div>
          <p>Transparent pixels use this color in the JPEG.</p>
        </div>
      ) : null}
      {settings.outputFormat === "jpeg" && settings.intakeSample.hasNonJpegSources ? (
        <p className="settings-panel__warning" role="status">
          <MaterialSymbol name="opacity" size={20} />
          JPEG does not support transparency. Transparent areas become {hex}.
        </p>
      ) : null}
    </div>
  );
}

function QualityPanel() {
  const settings = useCompressionSettings();

  return (
    <div className="settings-panel">
      <SegmentedControl
        label="Compression mode"
        onValueChange={(value) =>
          settings.updateCompressionMode(value as CompressionMode)
        }
        options={[
          { label: "Smart", value: "smart" },
          { label: "Quality", value: "quality" },
          { label: "Target size", value: "target-size" },
        ]}
        value={settings.compressionMode}
      />
      <p className="settings-panel__note">
        {settings.compressionMode === "smart"
          ? "Recommended settings keep proportions and transparency-capable formats, never enlarge images and remove metadata."
          : settings.compressionMode === "quality"
            ? "Choose the balance between visual detail and file size."
            : "The highest tested quality that still fits your limit."}
      </p>
      {settings.compressionMode === "quality" ? (
        <Slider
          formatValue={(value) => `${value}%`}
          hint={
            settings.outputFormat === "keep"
              ? "Applies to JPEG, WebP and AVIF. PNG output remains lossless."
              : "Higher quality keeps more detail and usually creates a larger file."
          }
          label="Compression quality"
          min={1}
          onChange={(event) => settings.updateQuality(event.target.value)}
          value={settings.quality}
        />
      ) : null}
      {settings.compressionMode === "target-size" ? (
        <div className="settings-panel__stack">
          <SegmentedControl
            label="Target size preset"
            onValueChange={(value) => settings.updateTargetPreset(value as TargetPreset)}
            options={[
              { label: "100 KB", value: "100" },
              { label: "200 KB", value: "200" },
              { label: "500 KB", value: "500" },
              { label: "1 MB", value: "1024" },
              { label: "Custom", value: "custom" },
            ]}
            value={settings.targetPreset}
          />
          {settings.targetPreset === "custom" ? (
            <div className="settings-panel__row">
              <Input
                error={
                  settings.customTargetBytes
                    ? undefined
                    : "Enter a size greater than zero and no larger than 1 GB."
                }
                inputMode="decimal"
                label="Target size"
                min="0.01"
                onChange={(event) => settings.updateCustomTarget(event.target.value)}
                step="0.01"
                type="number"
                value={settings.customTarget}
              />
              <Select
                label="Unit"
                onValueChange={(value) =>
                  settings.updateCustomTargetUnit(value as "kb" | "mb")
                }
                options={[
                  { label: "KB", value: "kb" },
                  { label: "MB", value: "mb" },
                ]}
                value={settings.customTargetUnit}
              />
            </div>
          ) : null}
          <Switch
            checked={settings.allowDimensionReduction}
            description="If quality alone cannot reach the target, reduce dimensions while preserving proportions. The shorter edge never goes below 256 px."
            label="Smart fit"
            onChange={(event) => settings.updateDimensionReduction(event.target.checked)}
          />
        </div>
      ) : null}
    </div>
  );
}

function ResizePanel() {
  const settings = useCompressionSettings();
  const exact = settings.resizeMode === "exact";

  return (
    <div className="settings-panel">
      <Switch
        checked={settings.resizeEnabled}
        description="Choose a fitting rule. Smaller images are never enlarged."
        label="Resize images"
        onChange={(event) => settings.updateResizeEnabled(event.target.checked)}
      />
      {settings.resizeEnabled ? (
        <>
          <SegmentedControl
            label="Resize behavior"
            onValueChange={(value) => settings.updateResizeMode(value as ResizeMode)}
            options={[
              { label: "Fit within", value: "max" },
              { label: "Exact size", value: "exact" },
            ]}
            value={settings.resizeMode}
          />
          <div className="settings-panel__row">
            <Input
              aria-invalid={settings.resizeInputError || undefined}
              inputMode="numeric"
              label={exact ? "Width" : "Maximum width"}
              max={32768}
              min={1}
              onChange={(event) => settings.updateMaxWidth(event.target.value)}
              placeholder={exact ? undefined : "No limit"}
              type="number"
              value={settings.maxWidth}
            />
            <Input
              aria-invalid={settings.resizeInputError || undefined}
              inputMode="numeric"
              label={exact ? "Height" : "Maximum height"}
              max={32768}
              min={1}
              onChange={(event) => settings.updateMaxHeight(event.target.value)}
              placeholder={exact ? undefined : "No limit"}
              type="number"
              value={settings.maxHeight}
            />
          </div>
          {exact ? (
            <Switch
              checked={settings.preserveAspectRatio}
              description={
                settings.preserveAspectRatio
                  ? "Center-crop to fill the exact size. No stretching."
                  : "Stretch to fill. Image proportions may change."
              }
              label="Preserve proportions"
              onChange={(event) => settings.updateAspectRatio(event.target.checked)}
            />
          ) : null}
          {settings.resizeInputError ? (
            <p className="settings-panel__error" role="alert">
              {exact
                ? "Enter a width and height from 1 to 32,768 pixels."
                : "Enter at least one valid maximum dimension."}
            </p>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

function NamingPanel() {
  const settings = useCompressionSettings();
  const preview = createOutputName(
    "holiday-photo.jpg",
    resolveOutputFormat("jpeg", settings.outputFormat),
    settings.namingSettings,
    { dimensions: { height: 800, width: 1200 }, sequence: 0 },
  );

  return (
    <div className="settings-panel">
      <Switch
        checked={settings.customNaming}
        description="Add a prefix, suffix, pattern or sequence number to every output."
        label="Customize file names"
        onChange={(event) => settings.updateCustomNaming(event.target.checked)}
      />
      {settings.customNaming ? (
        <>
          <div className="settings-panel__row">
            <Input
              label="Prefix"
              maxLength={40}
              onChange={(event) => settings.updateNamePrefix(event.target.value)}
              placeholder="web-"
              value={settings.namePrefix}
            />
            <Input
              label="Suffix"
              maxLength={40}
              onChange={(event) => settings.updateNameSuffix(event.target.value)}
              placeholder="-compressed"
              value={settings.nameSuffix}
            />
          </div>
          <Input
            hint="Tokens: {name}, {number}, {width}, {height}, {format}, {ext}, {page}"
            label="Naming pattern"
            maxLength={120}
            onChange={(event) => settings.updateNamePattern(event.target.value)}
            placeholder="{name}-{number}"
            value={settings.namePattern}
          />
          <div className="settings-panel__row">
            <Input
              error={
                Number.isInteger(settings.parsedSequenceStart) &&
                settings.parsedSequenceStart >= 0 &&
                settings.parsedSequenceStart <= 999_999
                  ? undefined
                  : "Enter a number from 0 to 999,999."
              }
              inputMode="numeric"
              label="Sequence starts at"
              max={999999}
              min={0}
              onChange={(event) => settings.updateSequenceStart(event.target.value)}
              type="number"
              value={settings.sequenceStart}
            />
            <Input
              error={
                Number.isInteger(settings.parsedSequencePadding) &&
                settings.parsedSequencePadding >= 1 &&
                settings.parsedSequencePadding <= 6
                  ? undefined
                  : "Enter padding from 1 to 6."
              }
              inputMode="numeric"
              label="Zero padding"
              max={6}
              min={1}
              onChange={(event) => settings.updateSequencePadding(event.target.value)}
              type="number"
              value={settings.sequencePadding}
            />
          </div>
          <Select
            label="Letter case"
            onValueChange={(value) =>
              settings.updateNameCase(value as "lowercase" | "unchanged" | "uppercase")
            }
            options={[
              { label: "Keep unchanged", value: "unchanged" },
              { label: "lowercase", value: "lowercase" },
              { label: "UPPERCASE", value: "uppercase" },
            ]}
            value={settings.nameCase}
          />
        </>
      ) : null}
      <p className="settings-panel__example">
        <span>Example</span>
        <code>{preview}</code>
      </p>
    </div>
  );
}

function MetadataPanel() {
  const settings = useCompressionSettings();

  return (
    <div className="settings-panel">
      <Switch
        checked={settings.stripMetadata}
        description="Removes camera details, comments, color profiles and GPS location data."
        label="Remove metadata (recommended)"
        onChange={(event) => settings.updateStripMetadata(event.target.checked)}
      />
      {!settings.stripMetadata ? (
        <p className="settings-panel__warning">
          <MaterialSymbol name="warning" size={20} />
          JPEG to JPEG can preserve EXIF, IPTC, ICC, comments and GPS data. Other format
          paths may only preserve part of the original metadata.
        </p>
      ) : (
        <p className="settings-panel__note">
          Metadata can reveal where and when a photo was taken. Removing it also keeps
          output files smaller.
        </p>
      )}
    </div>
  );
}

function SettingsPanel({ id }: { id: SettingsGroupId }) {
  if (id === "preset") return <PresetPanel />;
  if (id === "format") return <FormatPanel />;
  if (id === "quality") return <QualityPanel />;
  if (id === "resize") return <ResizePanel />;
  if (id === "naming") return <NamingPanel />;
  return <MetadataPanel />;
}

function groupValue(
  group: SettingsGroupId,
  controller: ReturnType<typeof useCompressionSettings>,
) {
  if (group === "preset") return controller.selectedPreset?.label ?? "Custom";
  if (group === "format") return describeOutputFormat(controller.outputFormat);
  if (group === "quality") {
    return describeCompressionMode(
      controller.compressionMode,
      controller.quality,
      controller.targetPreset,
      controller.customTarget,
      controller.customTargetUnit,
    );
  }
  if (group === "resize") {
    return describeResize(
      controller.resizeEnabled,
      controller.resizeMode,
      controller.maxWidth,
      controller.maxHeight,
    );
  }
  if (group === "naming")
    return controller.customNaming ? "Custom pattern" : "Original names";
  return controller.stripMetadata ? "Removed" : "Preserved";
}

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

const subscribeToPopoverSupport = () => () => undefined;

function supportsPopover() {
  return typeof HTMLElement !== "undefined" && "showPopover" in HTMLElement.prototype;
}

export function CompressionSettingsMenu({
  featuredGroup,
}: {
  featuredGroup?: SettingsGroupId;
}) {
  const settings = useCompressionSettings();
  const [openGroupId, setOpenGroupId] = useState<SettingsGroupId | null>(null);
  const [renderedGroup, setRenderedGroup] = useState<SettingsGroup | null>(null);
  const popoverSupported = useSyncExternalStore(
    subscribeToPopoverSupport,
    supportsPopover,
    () => false,
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef(new Map<SettingsGroupId, HTMLButtonElement>());
  const dropdownId = useId();
  const orderedGroups = featuredGroup
    ? [
        SETTINGS_GROUPS.find((group) => group.id === featuredGroup),
        ...SETTINGS_GROUPS.filter((group) => group.id !== featuredGroup),
      ].filter((group): group is SettingsGroup => Boolean(group))
    : SETTINGS_GROUPS;

  const positionDropdown = useCallback(() => {
    const dropdown = dropdownRef.current;
    const trigger = openGroupId ? pillRefs.current.get(openGroupId) : null;
    if (!dropdown || !trigger) return;

    const gap = 10;
    const margin = 12;
    const width = Math.min(400, window.innerWidth - margin * 2);
    dropdown.style.width = `${width}px`;

    const rect = trigger.getBoundingClientRect();
    const height = dropdown.offsetHeight;
    const fitsBelow = rect.bottom + gap + height <= window.innerHeight - margin;
    const left = Math.min(
      Math.max(margin, rect.left),
      Math.max(margin, window.innerWidth - width - margin),
    );
    dropdown.style.left = `${left}px`;
    dropdown.style.top = `${Math.max(
      margin,
      fitsBelow ? rect.bottom + gap : rect.top - gap - height,
    )}px`;
    dropdown.dataset.placement = fitsBelow ? "below" : "above";
  }, [openGroupId]);

  useIsomorphicLayoutEffect(() => {
    const dropdown = dropdownRef.current;
    if (!dropdown) return;

    if (!popoverSupported) {
      if (openGroupId) positionDropdown();
      return;
    }

    if (openGroupId) {
      if (!dropdown.matches(":popover-open")) dropdown.showPopover();
      positionDropdown();
    } else if (dropdown.matches(":popover-open")) {
      dropdown.hidePopover();
    }
  }, [openGroupId, popoverSupported, positionDropdown, renderedGroup]);

  useEffect(() => {
    if (!openGroupId) return;

    const reposition = () => positionDropdown();
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [openGroupId, positionDropdown]);

  useEffect(() => {
    if (!openGroupId) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (dropdownRef.current?.contains(target)) return;
      if (target.closest(".settings-pill")) return;
      setOpenGroupId(null);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenGroupId(null);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openGroupId]);

  function toggleGroup(event: MouseEvent<HTMLButtonElement>, group: SettingsGroup) {
    const willOpen = openGroupId !== group.id;
    setRenderedGroup(group);
    setOpenGroupId(willOpen ? group.id : null);

    if (willOpen && event.detail === 0) {
      // Keyboard activation moves focus into the panel so Tab reaches controls.
      requestAnimationFrame(() => {
        dropdownRef.current
          ?.querySelector<HTMLElement>(
            "select, input, button, a[href], [tabindex]:not([tabindex='-1'])",
          )
          ?.focus();
      });
    }
  }

  return (
    <div className="settings-rail">
      <span className="settings-rail__title">
        <MaterialSymbol name="tune" size={20} />
        <span className="settings-rail__title-text">Settings</span>
      </span>
      <div
        aria-label="Compression settings"
        className="settings-rail__pills"
        role="group"
      >
        {orderedGroups.map((group) => {
          const customized = isGroupCustomized(group.id, settings);
          const expanded = openGroupId === group.id;
          return (
            <button
              ref={(node) => {
                if (node) pillRefs.current.set(group.id, node);
                else pillRefs.current.delete(group.id);
              }}
              aria-controls={dropdownId}
              aria-expanded={expanded}
              aria-haspopup="dialog"
              className={classNames(
                "settings-pill motion-safe-transition",
                featuredGroup === group.id && "settings-pill--featured",
                customized && "settings-pill--customized",
              )}
              key={group.id}
              onClick={(event) => toggleGroup(event, group)}
              type="button"
            >
              <MaterialSymbol
                className="settings-pill__icon"
                name={group.icon}
                size={20}
              />
              <span className="settings-pill__text">
                <span className="settings-pill__label">{group.label}</span>
                <span className="settings-pill__value">
                  {groupValue(group.id, settings)}
                </span>
              </span>
              <MaterialSymbol
                className="settings-pill__chevron"
                name="expand_more"
                size={20}
              />
            </button>
          );
        })}

        <div
          aria-label={renderedGroup ? `${renderedGroup.label} settings` : "Settings"}
          className={classNames(
            "settings-dropdown",
            !popoverSupported && "settings-dropdown--fallback",
            openGroupId && "settings-dropdown--open",
          )}
          id={dropdownId}
          popover={popoverSupported ? "manual" : undefined}
          ref={dropdownRef}
          role="dialog"
        >
          {renderedGroup ? (
            <>
              <div className="settings-dropdown__header">
                <MaterialSymbol name={renderedGroup.icon} size={20} />
                <strong>{renderedGroup.label}</strong>
              </div>
              <div className="settings-dropdown__body" key={renderedGroup.id}>
                <SettingsPanel id={renderedGroup.id} />
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export type { SettingsGroupId };
