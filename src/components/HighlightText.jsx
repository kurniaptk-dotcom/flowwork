import React from 'react';

/**
 * Highlights matches of query within text smoothly with visual badge/mark
 */
export const HighlightText = ({ text = '', highlight = '' }) => {
  if (!highlight || !highlight.trim() || !text) {
    return text;
  }

  const query = highlight.trim();
  // Escape regex special chars
  const escaped = query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = String(text).split(regex);

  if (parts.length === 1) {
    return text;
  }

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={index} className="flow-search-highlight">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
};
