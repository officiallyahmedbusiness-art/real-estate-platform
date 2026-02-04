"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Badge } from "@/components/ui";
import { FieldCheckbox, FieldInput, FieldSelect, FieldWrapper } from "@/components/FieldHelp";

type Attachment = {
  id: string;
  file_path: string;
  file_type: string;
  category: string;
  title: string | null;
  note: string | null;
  sort_order: number;
  is_primary: boolean;
  is_published: boolean;
  signed_url: string | null;
  metadata: Record<string, unknown> | null;
};

type Option = { value: string; label: string };

type Labels = {
  title: string;
  subtitle: string;
  upload: string;
  drag: string;
  category: string;
  titleLabel: string;
  noteLabel: string;
  primary: string;
  published: string;
  copy: string;
  delete: string;
  empty: string;
  fileType: string;
  sizeLimit: string;
};

type AttachmentActions = {
  upload: (formData: FormData) => Promise<{ ok: boolean; results?: unknown; error?: string }>;
  remove: (formData: FormData) => Promise<{ ok: boolean; error?: string }>;
  update: (formData: FormData) => Promise<{ ok: boolean; error?: string }>;
  reorder: (formData: FormData) => Promise<{ ok: boolean; error?: string }>;
  signedUrl: (formData: FormData) => Promise<{ ok: boolean; url?: string; error?: string }>;
};

function iconFor(type: string) {
  if (type === "pdf") return "PDF";
  if (type === "video") return "VID";
  if (type === "doc") return "DOC";
  return "FILE";
}

export function AttachmentsManager({
  listingId,
  attachments,
  categories,
  fileTypes,
  labels,
  actions,
}: {
  listingId: string;
  attachments: Attachment[];
  categories: Option[];
  fileTypes: Option[];
  labels: Labels;
  actions: AttachmentActions;
}) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("all");
  const [uploadCategory, setUploadCategory] = useState(categories[0]?.value ?? "unit_photos");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadNote, setUploadNote] = useState("");
  const [pending, startTransition] = useTransition();
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (activeCategory === "all") return attachments;
    return attachments.filter((item) => item.category === activeCategory);
  }, [attachments, activeCategory]);

  const ordered = [...filtered].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    return a.sort_order - b.sort_order;
  });

  function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    const formData = new FormData();
    formData.append("listing_id", listingId);
    formData.append("category", uploadCategory);
    if (uploadTitle) formData.append("title", uploadTitle);
    if (uploadNote) formData.append("note", uploadNote);
    for (const file of Array.from(files)) {
      formData.append("files", file);
    }
    startTransition(async () => {
      await actions.upload(formData);
      setUploadTitle("");
      setUploadNote("");
      router.refresh();
    });
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    handleUpload(event.dataTransfer.files);
  }

  function handleDragStart(id: string) {
    setDraggingId(id);
  }

  function handleDropItem(targetId: string) {
    if (!draggingId || draggingId === targetId) return;
    const newOrder = [...attachments];
    const fromIndex = newOrder.findIndex((item) => item.id === draggingId);
    const toIndex = newOrder.findIndex((item) => item.id === targetId);
    if (fromIndex === -1 || toIndex === -1) return;
    const [moved] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, moved);
    const orderedIds = newOrder.map((item) => item.id).join(",");
    const formData = new FormData();
    formData.append("listing_id", listingId);
    formData.append("ordered_ids", orderedIds);
    startTransition(async () => {
      await actions.reorder(formData);
      router.refresh();
    });
    setDraggingId(null);
  }

  function handleUpdate(id: string, patch: Record<string, string | boolean | number>) {
    const formData = new FormData();
    formData.append("attachment_id", id);
    Object.entries(patch).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    startTransition(async () => {
      await actions.update(formData);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    const formData = new FormData();
    formData.append("attachment_id", id);
    startTransition(async () => {
      await actions.remove(formData);
      router.refresh();
    });
  }

  async function handleCopy(id: string) {
    const formData = new FormData();
    formData.append("attachment_id", id);
    const res = await actions.signedUrl(formData);
    if (res.ok && res.url) {
      await navigator.clipboard.writeText(res.url);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">{labels.title}</h3>
          <p className="text-sm text-[var(--muted)]">{labels.subtitle}</p>
        </div>
        <Badge>{labels.sizeLimit}</Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={activeCategory === "all" ? "primary" : "ghost"}
          onClick={() => setActiveCategory("all")}
        >
          {labels.category}
        </Button>
        {categories.map((category) => (
          <Button
            key={category.value}
            type="button"
            size="sm"
            variant={activeCategory === category.value ? "primary" : "ghost"}
            onClick={() => setActiveCategory(category.value)}
          >
            {category.label}
          </Button>
        ))}
      </div>

      <div
        className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-4 py-5 text-sm text-[var(--muted)]"
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-[var(--text)]">{labels.upload}</span>
          <span>{labels.drag}</span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <FieldSelect
            label={labels.category}
            helpKey="attachments.upload.category"
            value={uploadCategory}
            onChange={(event) => setUploadCategory(event.target.value)}
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </FieldSelect>
          <FieldInput
            label={labels.titleLabel}
            helpKey="attachments.upload.title"
            value={uploadTitle}
            onChange={(event) => setUploadTitle(event.target.value)}
            placeholder={labels.titleLabel}
          />
          <FieldInput
            label={labels.noteLabel}
            helpKey="attachments.upload.note"
            value={uploadNote}
            onChange={(event) => setUploadNote(event.target.value)}
            placeholder={labels.noteLabel}
          />
          <FieldWrapper label={labels.upload} helpKey="attachments.upload.file">
            <label className="flex cursor-pointer items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-sm text-[var(--text)]">
              <input
                type="file"
                className="sr-only"
                multiple
                disabled={pending}
                onChange={(event) => handleUpload(event.target.files)}
                data-no-help
              />
              {labels.upload}
            </label>
          </FieldWrapper>
        </div>
      </div>

      {ordered.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-6 text-sm text-[var(--muted)]">
          {labels.empty}
        </div>
      ) : (
        <div className="grid gap-4">
          {ordered.map((attachment) => {
            const fileLabel =
              fileTypes.find((item) => item.value === attachment.file_type)?.label ??
              attachment.file_type;
            return (
              <div
                key={attachment.id}
                draggable
                onDragStart={() => handleDragStart(attachment.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => handleDropItem(attachment.id)}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4"
              >
                <div className="h-16 w-24 overflow-hidden rounded-xl bg-[var(--surface-2)]">
                  {attachment.file_type === "image" && attachment.signed_url ? (
                    <img
                      src={attachment.signed_url}
                      alt={attachment.title ?? attachment.metadata?.name?.toString() ?? "image"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xl">
                      {iconFor(attachment.file_type)}
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>
                      {labels.fileType}: {fileLabel}
                    </Badge>
                    <Badge>
                      {categories.find((item) => item.value === attachment.category)?.label ??
                        attachment.category}
                    </Badge>
                    {attachment.is_primary ? <Badge>{labels.primary}</Badge> : null}
                    {attachment.is_published ? <Badge>{labels.published}</Badge> : null}
                  </div>
                  <div className="grid gap-2 md:grid-cols-3">
                    <FieldInput
                      label={labels.titleLabel}
                      helpKey="attachments.item.title"
                      defaultValue={attachment.title ?? ""}
                      placeholder={labels.titleLabel}
                      onBlur={(event) =>
                        handleUpdate(attachment.id, { title: event.target.value || "" })
                      }
                    />
                    <FieldInput
                      label={labels.noteLabel}
                      helpKey="attachments.item.note"
                      defaultValue={attachment.note ?? ""}
                      placeholder={labels.noteLabel}
                      onBlur={(event) =>
                        handleUpdate(attachment.id, { note: event.target.value || "" })
                      }
                    />
                    <FieldSelect
                      label={labels.category}
                      helpKey="attachments.item.category"
                      defaultValue={attachment.category}
                      onChange={(event) =>
                        handleUpdate(attachment.id, { category: event.target.value })
                      }
                    >
                      {categories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </FieldSelect>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <FieldCheckbox
                    label={labels.primary}
                    helpKey="attachments.item.primary"
                    checked={attachment.is_primary}
                    onChange={(event) =>
                      handleUpdate(attachment.id, { is_primary: event.target.checked })
                    }
                  />
                  <FieldCheckbox
                    label={labels.published}
                    helpKey="attachments.item.published"
                    checked={attachment.is_published}
                    onChange={(event) =>
                      handleUpdate(attachment.id, { is_published: event.target.checked })
                    }
                  />
                  <Button type="button" size="sm" variant="ghost" onClick={() => handleCopy(attachment.id)}>
                    {labels.copy}
                  </Button>
                  <Button type="button" size="sm" variant="danger" onClick={() => handleDelete(attachment.id)}>
                    {labels.delete}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
