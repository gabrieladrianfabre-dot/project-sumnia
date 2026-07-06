import katex from 'katex'

// Renders curator text containing $inline$ and $$display$$ LaTeX segments,
// plus **bold** emphasis. Malformed LaTeX degrades to red source text
// (throwOnError: false) instead of crashing the page.
const MATH_SPLIT = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g
const BOLD_SPLIT = /(\*\*[^*]+\*\*)/g

function Tex({ tex, display }) {
  const html = katex.renderToString(tex, {
    throwOnError: false,
    displayMode: display,
    strict: 'ignore',
  })
  return <span dangerouslySetInnerHTML={{ __html: html }} />
}

function PlainText({ text }) {
  return text.split(BOLD_SPLIT).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i} className="font-semibold text-frost">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  )
}

export default function MathText({ text, className = '' }) {
  if (!text) return null
  const parts = text.split(MATH_SPLIT)
  return (
    <div className={`prose-math ${className}`}>
      {parts.map((part, i) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          return <Tex key={i} tex={part.slice(2, -2)} display />
        }
        if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
          return <Tex key={i} tex={part.slice(1, -1)} display={false} />
        }
        return <PlainText key={i} text={part} />
      })}
    </div>
  )
}
