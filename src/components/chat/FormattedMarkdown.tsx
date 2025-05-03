import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Styled markdown renderer component
export const FormattedMarkdown = ({ children }: { children: string }) => {
  return (
    <div className="markdown-content prose prose-sm max-w-none overflow-hidden">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // @ts-expect-error - The types for react-markdown are not correctly defining the inline prop
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            
            // Special handling for HTML content - render it directly
            if (match && match[1] === 'html') {
              return (
                <div 
                  dangerouslySetInnerHTML={{ __html: String(children).replace(/\n$/, '') }} 
                  className="overflow-x-auto custom-scrollbar"
                  style={{
                    maxWidth: '100%',
                    overflowY: 'hidden'
                  }}
                />
              );
            }
            
            return !inline && match ? (
              <SyntaxHighlighter
                style={atomDark}
                language={match[1]}
                PreTag="div"
                className="rounded-md my-2"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className="bg-secondary/30 px-1.5 py-0.5 rounded" {...props}>
                {children}
              </code>
            );
          },
          h1({ node, ...props }) {
            return <h1 className="text-xl font-semibold mt-3 mb-2" {...props} />;
          },
          h2({ node, ...props }) {
            return <h2 className="text-lg font-semibold mt-3 mb-2" {...props} />;
          },
          h3({ node, ...props }) {
            return <h3 className="text-base font-semibold mt-2 mb-1" {...props} />;
          },
          p({ node, ...props }) {
            return <p className="mb-2" {...props} />;
          },
          ul({ node, ...props }) {
            return <ul className="list-disc pl-5 my-2" {...props} />;
          },
          ol({ node, ...props }) {
            return <ol className="list-decimal pl-5 my-2" {...props} />;
          },
          li({ node, ...props }) {
            return <li className="my-1" {...props} />;
          },
          table({ node, ...props }) {
            return (
              <div className="overflow-x-auto custom-scrollbar my-3 border border-border rounded-md">
                <table className="border-collapse min-w-full text-sm" {...props} />
              </div>
            );
          },
          thead({ node, ...props }) {
            return <thead className="bg-secondary/50 sticky top-0" {...props} />;
          },
          tbody({ node, ...props }) {
            return <tbody className="divide-y divide-border" {...props} />;
          },
          tr({ node, ...props }) {
            return <tr className="hover:bg-secondary/30" {...props} />;
          },
          th({ node, ...props }) {
            return <th className="px-3 py-2 text-left font-medium text-foreground" {...props} />;
          },
          td({ node, ...props }) {
            return <td className="px-3 py-2 whitespace-normal break-words border-t border-border" {...props} />;
          },
          a({ node, ...props }) {
            return <a className="text-primary underline hover:text-primary/80" {...props} />;
          },
          blockquote({ node, ...props }) {
            return <blockquote className="border-l-4 border-border pl-4 my-2 italic" {...props} />;
          },
          img({ node, ...props }) {
            return <img className="max-w-full h-auto rounded-md my-2" {...props} />;
          },
          hr({ node, ...props }) {
            return <hr className="my-4 border-border" {...props} />;
          }
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}; 