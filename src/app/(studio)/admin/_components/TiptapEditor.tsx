"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { EditorContent, useEditor } from "@tiptap/react";

import { uploadTiptapImage } from "@/app/actions/product";

import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import {
  Table,
  TableRow,
  TableHeader,
  TableCell,
} from "@tiptap/extension-table";

type TiptapEditorProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
};

const TiptapEditor = ({
  label,
  value,
  onChange,
  placeholder = "Enter product description...",
  minHeight = 300,
}: TiptapEditorProps) => {
  const [sourceMode, setSourceMode] = useState(false);
  const [html, setHtml] = useState(value || "");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,

      Underline,

      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),

      Image.configure({
        inline: false,
        allowBase64: false,
      }),

      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "technical-specs not-prose",
        },
      }),

      TableRow,
      TableHeader,
      TableCell,
    ],

    content: value || "",

    immediatelyRender: false,

    editorProps: {
      attributes: {
        class: "tiptap-editor focus:outline-none",
        "data-placeholder": placeholder,
      },
    },

    onUpdate: ({ editor }) => {
      const updatedHtml = editor.getHTML();

      setHtml(updatedHtml);
      onChange(updatedHtml);
    },
  });

  /*
   * Synchronize external value changes.
   *
   * Important when editing an existing product:
   * the editor may initialize before product data
   * is returned from the server/API.
   */
  useEffect(() => {
    if (!editor || sourceMode) return;

    const editorHtml = editor.getHTML();

    if (value !== editorHtml) {
      try {
        editor.commands.setContent(value || "", {
          emitUpdate: false,
        });

        setHtml(value || "");

        if (process.env.NODE_ENV === "development") {
          console.log("SOURCE HTML:", value);
          console.log("TIPTAP HTML:", editor.getHTML());
        }
      } catch (error) {
        console.error("Tiptap failed to parse HTML:", error);
      }
    }
  }, [editor, value, sourceMode]);

  if (!editor) {
    return (
      <div
        className="tiptap-loading"
        style={{
          minHeight,
        }}
      />
    );
  }

  const buttonClass = (
    active: boolean = false,
    disabled: boolean = false,
  ) => {
    return [
      "tiptap-toolbar-button",
      active ? "is-active" : "",
      disabled ? "is-disabled" : "",
    ]
      .filter(Boolean)
      .join(" ");
  };

  const setLink = () => {
    const previousUrl =
      (editor.getAttributes("link").href as string | undefined) || "";

    const url = window.prompt(
      "Enter URL",
      previousUrl || "https://",
    );

    if (url === null) return;

    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .unsetLink()
        .run();

      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({
        href: trimmedUrl,
      })
      .run();
  };

  const handleImageUpload = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setIsUploadingImage(true);

      const formData = new FormData();
      formData.append("image", file);

      const result = await uploadTiptapImage(formData);

      if (!result.success || !result.url) {
        throw new Error(
          result.message || "Image upload failed",
        );
      }

      editor
        .chain()
        .focus()
        .setImage({
          src: result.url,
          alt: file.name,
        })
        .run();
    } catch (error) {
      console.error("Image upload failed:", error);

      window.alert(
        error instanceof Error
          ? error.message
          : "Failed to upload image.",
      );
    } finally {
      setIsUploadingImage(false);
      event.target.value = "";
    }
  };

  const deleteSelectedImage = () => {
    if (!editor.isActive("image")) return;

    editor
      .chain()
      .focus()
      .deleteNode("image")
      .run();
  };

  const toggleSourceMode = () => {
    /*
     * Going from HTML source -> visual editor
     */
    if (sourceMode) {
      try {
        editor.commands.setContent(html || "", {
          emitUpdate: false,
        });

        onChange(editor.getHTML());
        setHtml(editor.getHTML());
      } catch (error) {
        console.error("Tiptap failed to parse HTML source:", error);
        return;
      }
    } else {
      /*
       * Going from visual editor -> HTML source
       */
      const currentHtml = editor.getHTML();

      setHtml(currentHtml);
    }

    setSourceMode((previous) => !previous);
  };

  return (
    <div className="tiptap-wrapper">
      {label && (
        <label className="block mb-1.5 text-sm text-gray-6">
          {label}
        </label>
      )}

      {/* =========================
          TOOLBAR
      ========================== */}

      <div className="tiptap-toolbar">
        {!sourceMode && (
          <>
            {/* TEXT TYPE */}

            <div className="tiptap-toolbar-group">
              <button
                type="button"
                onClick={() =>
                  editor.chain().focus().setParagraph().run()
                }
                className={buttonClass(
                  editor.isActive("paragraph"),
                )}
                title="Paragraph"
              >
                P
              </button>

              <button
                type="button"
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .toggleHeading({
                      level: 2,
                    })
                    .run()
                }
                className={buttonClass(
                  editor.isActive("heading", {
                    level: 2,
                  }),
                )}
                title="Heading 2"
              >
                H2
              </button>

              <button
                type="button"
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .toggleHeading({
                      level: 3,
                    })
                    .run()
                }
                className={buttonClass(
                  editor.isActive("heading", {
                    level: 3,
                  }),
                )}
                title="Heading 3"
              >
                H3
              </button>
            </div>

            <div className="tiptap-toolbar-separator" />

            {/* TEXT FORMATTING */}

            <div className="tiptap-toolbar-group">
              <button
                type="button"
                onClick={() =>
                  editor.chain().focus().toggleBold().run()
                }
                className={buttonClass(
                  editor.isActive("bold"),
                )}
                title="Bold"
              >
                <strong>B</strong>
              </button>

              <button
                type="button"
                onClick={() =>
                  editor.chain().focus().toggleItalic().run()
                }
                className={buttonClass(
                  editor.isActive("italic"),
                )}
                title="Italic"
              >
                <em>I</em>
              </button>

              <button
                type="button"
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .toggleUnderline()
                    .run()
                }
                className={buttonClass(
                  editor.isActive("underline"),
                )}
                title="Underline"
              >
                <u>U</u>
              </button>

            </div>

            <div className="tiptap-toolbar-separator" />

            {/* LISTS */}

            <div className="tiptap-toolbar-group">
              <button
                type="button"
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .toggleBulletList()
                    .run()
                }
                className={buttonClass(
                  editor.isActive("bulletList"),
                )}
                title="Bullet list"
              >
                • List
              </button>

              <button
                type="button"
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .toggleOrderedList()
                    .run()
                }
                className={buttonClass(
                  editor.isActive("orderedList"),
                )}
                title="Numbered list"
              >
                1. List
              </button>

            </div>

            <div className="tiptap-toolbar-separator" />

            {/* LINK */}

            <div className="tiptap-toolbar-group">
              <button
                type="button"
                onClick={setLink}
                className={buttonClass(
                  editor.isActive("link"),
                )}
                title="Add or edit link"
              >
                Link
              </button>

              {editor.isActive("link") && (
                <button
                  type="button"
                  onClick={() =>
                    editor
                      .chain()
                      .focus()
                      .extendMarkRange("link")
                      .unsetLink()
                      .run()
                  }
                  className={buttonClass()}
                  title="Remove link"
                >
                  Unlink
                </button>
              )}

              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={isUploadingImage}
                className={buttonClass(
                  editor.isActive("image"),
                  isUploadingImage,
                )}
                title="Upload image from computer"
              >
                {isUploadingImage ? "Uploading..." : "Image"}
              </button>

              <input
                ref={imageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageUpload}
                hidden
              />

              {editor.isActive("image") && (
                <button
                  type="button"
                  onClick={deleteSelectedImage}
                  className={buttonClass()}
                  title="Remove selected image"
                >
                  Delete Image
                </button>
              )}
            </div>

            <div className="tiptap-toolbar-separator" />

            {/* =========================
                TABLE
            ========================== */}

            <div className="tiptap-toolbar-group">
              <button
                type="button"
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .insertTable({
                      rows: 3,
                      cols: 2,
                      withHeaderRow: true,
                    })
                    .run()
                }
                className={buttonClass()}
                title="Insert 3 × 2 table"
              >
                Table
              </button>

              {editor.isActive("table") && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      editor
                        .chain()
                        .focus()
                        .addRowBefore()
                        .run()
                    }
                    className={buttonClass()}
                    title="Add row above"
                  >
                    ↑ Row
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      editor
                        .chain()
                        .focus()
                        .addRowAfter()
                        .run()
                    }
                    className={buttonClass()}
                    title="Add row below"
                  >
                    ↓ Row
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      editor
                        .chain()
                        .focus()
                        .deleteRow()
                        .run()
                    }
                    className={buttonClass()}
                    title="Delete row"
                  >
                    − Row
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      editor
                        .chain()
                        .focus()
                        .addColumnBefore()
                        .run()
                    }
                    className={buttonClass()}
                    title="Add column before"
                  >
                    ← Col
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      editor
                        .chain()
                        .focus()
                        .addColumnAfter()
                        .run()
                    }
                    className={buttonClass()}
                    title="Add column after"
                  >
                    → Col
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      editor
                        .chain()
                        .focus()
                        .deleteColumn()
                        .run()
                    }
                    className={buttonClass()}
                    title="Delete column"
                  >
                    − Col
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      editor
                        .chain()
                        .focus()
                        .toggleHeaderRow()
                        .run()
                    }
                    className={buttonClass()}
                    title="Toggle header row"
                  >
                    Header
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      editor
                        .chain()
                        .focus()
                        .mergeCells()
                        .run()
                    }
                    disabled={
                      !editor.can().mergeCells()
                    }
                    className={buttonClass(
                      false,
                      !editor.can().mergeCells(),
                    )}
                    title="Merge selected cells"
                  >
                    Merge
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      editor
                        .chain()
                        .focus()
                        .splitCell()
                        .run()
                    }
                    disabled={
                      !editor.can().splitCell()
                    }
                    className={buttonClass(
                      false,
                      !editor.can().splitCell(),
                    )}
                    title="Split merged cell"
                  >
                    Split
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      editor
                        .chain()
                        .focus()
                        .deleteTable()
                        .run()
                    }
                    className={buttonClass()}
                    title="Delete table"
                  >
                    Delete Table
                  </button>
                </>
              )}
            </div>

            <div className="tiptap-toolbar-separator" />

            {/* UNDO / REDO */}

            <div className="tiptap-toolbar-group">
              <button
                type="button"
                onClick={() =>
                  editor.chain().focus().undo().run()
                }
                disabled={!editor.can().undo()}
                className={buttonClass(
                  false,
                  !editor.can().undo(),
                )}
                title="Undo"
              >
                Undo
              </button>

              <button
                type="button"
                onClick={() =>
                  editor.chain().focus().redo().run()
                }
                disabled={!editor.can().redo()}
                className={buttonClass(
                  false,
                  !editor.can().redo(),
                )}
                title="Redo"
              >
                Redo
              </button>
            </div>
          </>
        )}

        {/* HTML SOURCE */}

        <div className="tiptap-toolbar-source">
          <button
            type="button"
            onClick={toggleSourceMode}
            className={buttonClass(sourceMode)}
            title="Edit HTML source"
          >
            {"<>"} Code
          </button>
        </div>
      </div>

      {/* =========================
          VISUAL EDITOR
      ========================== */}

      {!sourceMode && (
        <div
          className="tiptap-content"
          style={{
            minHeight,
          }}
        >
          <EditorContent editor={editor} />
        </div>
      )}

      {/* =========================
          HTML SOURCE EDITOR
      ========================== */}

      {sourceMode && (
        <textarea
          value={html}
          onChange={(event) => {
            const updatedHtml =
              event.target.value;

            setHtml(updatedHtml);
            onChange(updatedHtml);
          }}
          spellCheck={false}
          className="tiptap-source"
          style={{
            minHeight,
          }}
        />
      )}
    </div>
  );
};

export default TiptapEditor;
