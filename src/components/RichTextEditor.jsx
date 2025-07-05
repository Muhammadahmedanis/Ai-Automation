import React, { useRef, useEffect, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link,
  Undo,
  Redo,
} from "lucide-react";

const RichTextEditor = ({
  value = "",
  onChange,
  placeholder = "Start writing...",
  height = "400px",
  showAiButton = false,
  onAiButtonClick,
  className = "",
  mobile = false,
}) => {
  const editorRef = useRef(null);
  const [isEditorFocused, setIsEditorFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  useEffect(() => {
    // Add CSS styles to the editor for better list formatting
    if (editorRef.current) {
      const style = document.createElement("style");
      style.textContent = `
        [contenteditable] ul, [contenteditable] ol {
          margin: 16px 0;
          padding-left: 24px;
        }
        [contenteditable] ul li, [contenteditable] ol li {
          margin: 4px 0;
          padding-left: 4px;
        }
        [contenteditable] ul {
          list-style-type: disc;
        }
        [contenteditable] ol {
          list-style-type: decimal;
        }
        [contenteditable] a {
          color: #3b82f6;
          text-decoration: underline;
        }
        [contenteditable] a:hover {
          color: #1d4ed8;
        }
        [contenteditable] b, [contenteditable] strong {
          font-weight: bold;
        }
        [contenteditable] i, [contenteditable] em {
          font-style: italic;
        }
        [contenteditable] u {
          text-decoration: underline;
        }
        [contenteditable] p {
          margin: 8px 0;
        }
      `;

      if (!document.head.querySelector("#rich-editor-styles")) {
        style.id = "rich-editor-styles";
        document.head.appendChild(style);
      }
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleKeyDown = (e) => {
    // Handle Enter key in lists
    if (e.key === "Enter") {
      const selection = window.getSelection();
      if (selection.rangeCount) {
        const range = selection.getRangeAt(0);
        const listItem =
          range.startContainer.closest?.("li") ||
          (range.startContainer.parentNode?.closest &&
            range.startContainer.parentNode.closest("li"));

        if (listItem) {
          e.preventDefault();

          // If current list item is empty, exit the list
          if (listItem.textContent.trim() === "") {
            const list = listItem.closest("ul, ol");
            if (list) {
              const newP = document.createElement("p");
              newP.innerHTML = "&nbsp;";
              list.parentNode.insertBefore(newP, list.nextSibling);
              listItem.remove();

              // If list is now empty, remove it
              if (list.children.length === 0) {
                list.remove();
              }

              // Position cursor in new paragraph
              const newRange = document.createRange();
              newRange.selectNodeContents(newP);
              newRange.collapse(true);
              selection.removeAllRanges();
              selection.addRange(newRange);

              handleInput();
              return;
            }
          } else {
            // Create new list item
            const newListItem = document.createElement("li");
            newListItem.innerHTML = "&nbsp;";
            listItem.parentNode.insertBefore(newListItem, listItem.nextSibling);

            // Position cursor in new list item
            const newRange = document.createRange();
            newRange.selectNodeContents(newListItem);
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);

            handleInput();
            return;
          }
        }
      }
    }
  };

  const executeCommand = (command, value = null) => {
    if (!editorRef.current) return;

    editorRef.current.focus();

    try {
      // Handle specific commands with modern approaches
      switch (command) {
        case "insertUnorderedList":
          insertList("ul");
          break;
        case "insertOrderedList":
          insertList("ol");
          break;
        case "bold":
          toggleFormat("b");
          break;
        case "italic":
          toggleFormat("i");
          break;
        case "underline":
          toggleFormat("u");
          break;
        case "justifyLeft":
          setAlignment("left");
          break;
        case "justifyCenter":
          setAlignment("center");
          break;
        case "justifyRight":
          setAlignment("right");
          break;
        case "undo":
          // Fallback to execCommand for undo/redo as they're still widely supported
          document.execCommand("undo", false, null);
          break;
        case "redo":
          document.execCommand("redo", false, null);
          break;
        default:
          // Fallback for other commands
          document.execCommand(command, false, value);
      }
    } catch (error) {
      console.warn("Command execution failed:", error);
      // Fallback to execCommand
      try {
        document.execCommand(command, false, value);
      } catch (fallbackError) {
        console.error("Fallback command execution also failed:", fallbackError);
      }
    }

    handleInput();
  };

  const toggleFormat = (tag) => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    if (selectedText) {
      const element = document.createElement(tag);
      element.textContent = selectedText;

      try {
        range.deleteContents();
        range.insertNode(element);

        // Clear selection
        selection.removeAllRanges();

        // Set cursor after the new element
        const newRange = document.createRange();
        newRange.setStartAfter(element);
        newRange.collapse(true);
        selection.addRange(newRange);
      } catch (error) {
        console.warn("Format toggle failed:", error);
        // Fallback to execCommand
        document.execCommand(
          tag === "b" ? "bold" : tag === "i" ? "italic" : "underline",
          false,
          null
        );
      }
    }
  };

  const setAlignment = (align) => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    let container = range.commonAncestorContainer;

    // Find the paragraph or div containing the selection
    while (container && container.nodeType !== Node.ELEMENT_NODE) {
      container = container.parentNode;
    }

    if (container && editorRef.current.contains(container)) {
      container.style.textAlign = align;
    }
  };

  const insertList = (listType) => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    let container = range.commonAncestorContainer;

    // Find the closest block element
    while (container && container.nodeType !== Node.ELEMENT_NODE) {
      container = container.parentNode;
    }

    // If we're already in a list, remove it
    const existingList = container.closest("ul, ol");
    if (existingList) {
      const items = Array.from(existingList.querySelectorAll("li"));
      const fragment = document.createDocumentFragment();

      items.forEach((item) => {
        const p = document.createElement("p");
        p.innerHTML = item.innerHTML;
        fragment.appendChild(p);
      });

      existingList.parentNode.replaceChild(fragment, existingList);
      return;
    }

    // Create new list
    const list = document.createElement(listType);
    const listItem = document.createElement("li");

    if (range.toString().trim()) {
      // If text is selected, put it in the list item
      listItem.appendChild(range.extractContents());
    } else {
      // Empty list item with placeholder
      listItem.innerHTML = "&nbsp;";
    }

    list.appendChild(listItem);

    try {
      range.insertNode(list);

      // Position cursor in the list item
      const newRange = document.createRange();
      newRange.selectNodeContents(listItem);
      newRange.collapse(false);
      selection.removeAllRanges();
      selection.addRange(newRange);
    } catch (error) {
      console.warn("List insertion failed:", error);
      // Fallback to execCommand
      document.execCommand(
        listType === "ul" ? "insertUnorderedList" : "insertOrderedList",
        false,
        null
      );
    }
  };

  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (!url) return;

    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    const link = document.createElement("a");
    link.href = url.startsWith("http") ? url : `https://${url}`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    if (selectedText) {
      link.textContent = selectedText;
      try {
        range.deleteContents();
        range.insertNode(link);

        // Clear selection and position cursor after link
        selection.removeAllRanges();
        const newRange = document.createRange();
        newRange.setStartAfter(link);
        newRange.collapse(true);
        selection.addRange(newRange);
      } catch (error) {
        console.warn("Link insertion failed:", error);
        // Fallback to execCommand
        document.execCommand("createLink", false, link.href);
      }
    } else {
      link.textContent = url;
      try {
        range.insertNode(link);

        // Position cursor after the link
        const newRange = document.createRange();
        newRange.setStartAfter(link);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      } catch (error) {
        console.warn("Link insertion failed:", error);
        // Fallback to execCommand
        document.execCommand("createLink", false, link.href);
      }
    }

    handleInput();
  };

  const toolbarButtons = mobile
    ? [
        { icon: Bold, command: "bold", title: "Bold" },
        { icon: Italic, command: "italic", title: "Italic" },
        { icon: List, command: "insertUnorderedList", title: "Bullet List" },
        { icon: Link, command: insertLink, title: "Insert Link" },
      ]
    : [
        { icon: Undo, command: "undo", title: "Undo" },
        { icon: Redo, command: "redo", title: "Redo" },
        { icon: Bold, command: "bold", title: "Bold" },
        { icon: Italic, command: "italic", title: "Italic" },
        { icon: Underline, command: "underline", title: "Underline" },
        { icon: AlignLeft, command: "justifyLeft", title: "Align Left" },
        { icon: AlignCenter, command: "justifyCenter", title: "Align Center" },
        { icon: AlignRight, command: "justifyRight", title: "Align Right" },
        { icon: List, command: "insertUnorderedList", title: "Bullet List" },
        {
          icon: ListOrdered,
          command: "insertOrderedList",
          title: "Numbered List",
        },
        { icon: Link, command: insertLink, title: "Insert Link" },
      ];

  return (
    <div
      className={`rich-text-editor border border-gray-200 rounded-xl overflow-hidden bg-white relative ${className}`}
    >
      {/* Toolbar */}
      <div className="border-b border-gray-200 bg-gray-50 p-3">
        <div className="flex flex-wrap gap-1">
          {toolbarButtons.map((button, index) => {
            const IconComponent = button.icon;
            return (
              <button
                key={index}
                type="button"
                className="p-2 rounded hover:bg-gray-200 transition-colors duration-200 text-gray-600 hover:text-gray-800"
                onClick={() => {
                  if (typeof button.command === "function") {
                    button.command();
                  } else {
                    executeCommand(button.command);
                  }
                }}
                title={button.title}
              >
                <IconComponent size={16} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Editor */}
      <div className="relative" style={{ height }}>
        <div
          ref={editorRef}
          contentEditable
          className="w-full h-full p-4 outline-none overflow-y-auto focus:ring-0"
          style={{
            minHeight: height,
            fontFamily: "Inter, Arial, sans-serif",
            fontSize: "14px",
            lineHeight: "1.6",
            paddingBottom: showAiButton ? "60px" : "16px", // Add padding if AI button is shown
          }}
          onInput={handleInput}
          onFocus={() => setIsEditorFocused(true)}
          onBlur={() => setIsEditorFocused(false)}
          onKeyDown={handleKeyDown}
          data-placeholder={placeholder}
          suppressContentEditableWarning={true}
        />

        {/* Placeholder */}
        {!value && !isEditorFocused && (
          <div
            className="absolute top-4 left-4 text-gray-400 pointer-events-none"
            style={{ fontStyle: "italic" }}
          >
            {placeholder}
          </div>
        )}
      </div>

      {/* AI Button - Positioned outside the scrollable area */}
      {showAiButton && (
        <div className="absolute bottom-4 right-4 z-50">
          <button
            onClick={onAiButtonClick}
            className="bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <span className="hidden sm:inline">✨ Write with AI</span>
            <span className="sm:hidden">✨ AI</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
