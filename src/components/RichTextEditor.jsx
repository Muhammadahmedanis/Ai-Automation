import React, { useRef, useEffect, useState } from 'react';
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
  Redo
} from 'lucide-react';

const RichTextEditor = ({
  value = '',
  onChange,
  placeholder = 'Start writing...',
  height = '400px',
  showAiButton = false,
  onAiButtonClick,
  className = '',
  mobile = false
}) => {
  const editorRef = useRef(null);
  const [isEditorFocused, setIsEditorFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const executeCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  const toolbarButtons = mobile ? [
    { icon: Bold, command: 'bold', title: 'Bold' },
    { icon: Italic, command: 'italic', title: 'Italic' },
    { icon: List, command: 'insertUnorderedList', title: 'Bullet List' },
    { icon: Link, command: insertLink, title: 'Insert Link' }
  ] : [
    { icon: Undo, command: 'undo', title: 'Undo' },
    { icon: Redo, command: 'redo', title: 'Redo' },
    { icon: Bold, command: 'bold', title: 'Bold' },
    { icon: Italic, command: 'italic', title: 'Italic' },
    { icon: Underline, command: 'underline', title: 'Underline' },
    { icon: AlignLeft, command: 'justifyLeft', title: 'Align Left' },
    { icon: AlignCenter, command: 'justifyCenter', title: 'Align Center' },
    { icon: AlignRight, command: 'justifyRight', title: 'Align Right' },
    { icon: List, command: 'insertUnorderedList', title: 'Bullet List' },
    { icon: ListOrdered, command: 'insertOrderedList', title: 'Numbered List' },
    { icon: Link, command: insertLink, title: 'Insert Link' }
  ];

  return (
    <div className={`rich-text-editor border border-gray-200 rounded-xl overflow-hidden bg-white relative ${className}`}>
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
                  if (typeof button.command === 'function') {
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
            fontFamily: 'Inter, Arial, sans-serif',
            fontSize: '14px',
            lineHeight: '1.6',
            paddingBottom: showAiButton ? '60px' : '16px' // Add padding if AI button is shown
          }}
          onInput={handleInput}
          onFocus={() => setIsEditorFocused(true)}
          onBlur={() => setIsEditorFocused(false)}
          data-placeholder={placeholder}
          suppressContentEditableWarning={true}
        />

        {/* Placeholder */}
        {!value && !isEditorFocused && (
          <div
            className="absolute top-4 left-4 text-gray-400 pointer-events-none"
            style={{ fontStyle: 'italic' }}
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
