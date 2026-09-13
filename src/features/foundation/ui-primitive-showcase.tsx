"use client";

import { useState } from "react";

import { MaterialSymbol } from "@/components/icons";
import {
  Button,
  Card,
  Dialog,
  IconButton,
  Input,
  SegmentedControl,
  Select,
  Sheet,
  Slider,
  useToast,
} from "@/components/ui";

const modeOptions = [
  {
    label: "Upload files",
    value: "upload",
    icon: <MaterialSymbol name="upload_file" size={20} />,
  },
  {
    label: "Image URL",
    value: "image-url",
    icon: <MaterialSymbol name="link" size={20} />,
  },
  {
    label: "Website URL",
    value: "website-url",
    icon: <MaterialSymbol name="travel_explore" size={20} />,
  },
] as const;

const formatOptions = [
  { label: "Keep original", value: "original" },
  { label: "WebP", value: "webp" },
  { label: "AVIF", value: "avif" },
  { label: "JPEG", value: "jpeg" },
  { label: "PNG", value: "png" },
] as const;

export function UiPrimitiveShowcase() {
  const [mode, setMode] = useState<(typeof modeOptions)[number]["value"]>("upload");
  const [quality, setQuality] = useState(82);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { showToast } = useToast();

  return (
    <div className="ui-showcase">
      <section className="ui-showcase__section" aria-labelledby="actions-title">
        <div className="ui-showcase__heading">
          <h2 id="actions-title">Actions</h2>
          <p>Primary, secondary, icon, loading and disabled states.</p>
        </div>
        <div className="ui-showcase__actions">
          <Button leadingIcon={<MaterialSymbol name="upload_file" size={20} />}>
            Choose images
          </Button>
          <Button variant="secondary">Advanced settings</Button>
          <Button loading>Compressing</Button>
          <Button disabled variant="secondary">
            Download
          </Button>
          <IconButton icon={<MaterialSymbol name="tune" />} label="Tune settings" />
        </div>
      </section>

      <section className="ui-showcase__section" aria-labelledby="controls-title">
        <div className="ui-showcase__heading">
          <h2 id="controls-title">Controls</h2>
          <p>Native inputs with shared labels, hints and validation treatment.</p>
        </div>
        <SegmentedControl
          label="Image source"
          onValueChange={setMode}
          options={modeOptions}
          value={mode}
        />
        <div className="ui-showcase__control-grid">
          <Input
            defaultValue="hero-compressed"
            hint="The extension is added automatically."
            label="File name"
          />
          <Select defaultValue="webp" label="Output format" options={formatOptions} />
          <Input
            error="Enter a target between 10 KB and 10 MB."
            label="Target size"
            placeholder="200 KB"
          />
          <Slider
            formatValue={(value) => `${value}%`}
            hint="Higher values preserve more detail."
            label="Quality"
            min={1}
            max={100}
            onChange={(event) => setQuality(Number(event.currentTarget.value))}
            value={quality}
          />
        </div>
      </section>

      <section className="ui-showcase__section" aria-labelledby="surfaces-title">
        <div className="ui-showcase__heading">
          <h2 id="surfaces-title">Surfaces</h2>
          <p>Cards carry hierarchy through tint and contrast instead of heavy shadows.</p>
        </div>
        <div className="ui-showcase__card-grid">
          <Card>
            <MaterialSymbol name="lock" />
            <h3>Private by default</h3>
            <p>Local files stay in this browser.</p>
          </Card>
          <Card variant="lavender">
            <MaterialSymbol name="speed" />
            <h3>Ready to optimize</h3>
            <p>Shared settings can flow into every tool mode.</p>
          </Card>
          <Card variant="dark">
            <MaterialSymbol name="image" />
            <h3>Built for images</h3>
            <p>The interface stays clear while the processing work gets complex.</p>
          </Card>
        </div>
      </section>

      <section className="ui-showcase__section" aria-labelledby="overlays-title">
        <div className="ui-showcase__heading">
          <h2 id="overlays-title">Overlays and feedback</h2>
          <p>Escape, backdrop click and explicit close controls are supported.</p>
        </div>
        <div className="ui-showcase__actions">
          <Button onClick={() => setDialogOpen(true)} variant="secondary">
            Open dialog
          </Button>
          <Button onClick={() => setSheetOpen(true)} variant="secondary">
            Open sheet
          </Button>
          <Button
            onClick={() =>
              showToast({
                title: "Settings saved",
                description: "Your browser will remember these choices.",
                variant: "success",
              })
            }
          >
            Show notification
          </Button>
        </div>
      </section>

      <Dialog
        description="This dialog verifies focus, keyboard dismissal and responsive layout."
        footer={
          <>
            <Button onClick={() => setDialogOpen(false)} variant="ghost">
              Cancel
            </Button>
            <Button
              onClick={() => {
                setDialogOpen(false);
                showToast({ title: "Changes applied", variant: "success" });
              }}
            >
              Apply changes
            </Button>
          </>
        }
        onOpenChange={setDialogOpen}
        open={dialogOpen}
        title="Compression settings"
      >
        <Input defaultValue="compressed" label="File suffix" />
      </Dialog>

      <Sheet
        description="Power-user settings stay out of the primary workflow."
        footer={<Button onClick={() => setSheetOpen(false)}>Done</Button>}
        onOpenChange={setSheetOpen}
        open={sheetOpen}
        title="Advanced settings"
      >
        <div className="ui-showcase__sheet-content">
          <Select defaultValue="original" label="Output format" options={formatOptions} />
          <Input hint="Images will never be enlarged." label="Maximum width" />
        </div>
      </Sheet>
    </div>
  );
}
