/**
 * HighlightedText Component
 * Highlights glossary terms in text and shows translation tooltips on hover
 */
import { useState, useEffect, useMemo } from 'react'

interface GlossaryTerm {
    term: string
    definition: string  // translation
    context?: string
}

interface HighlightedTextProps {
    text: string
    glossaryTerms: GlossaryTerm[]
    className?: string
    onInsertTranslation?: (translation: string) => void
}

// Escape special regex characters
function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function HighlightedText({
    text,
    glossaryTerms,
    className = '',
    onInsertTranslation
}: HighlightedTextProps): JSX.Element {
    const [hoveredTerm, setHoveredTerm] = useState<{ term: GlossaryTerm; x: number; y: number } | null>(null)

    // Build regex pattern from glossary terms
    const { regex, termMap } = useMemo(() => {
        if (!glossaryTerms || glossaryTerms.length === 0) {
            return { regex: null, termMap: new Map<string, GlossaryTerm>() }
        }

        // Sort by length (longest first) to match longer terms before shorter ones
        const sortedTerms = [...glossaryTerms]
            .filter(t => t.term && t.term.length > 1) // Skip single characters
            .sort((a, b) => b.term.length - a.term.length)

        if (sortedTerms.length === 0) {
            return { regex: null, termMap: new Map<string, GlossaryTerm>() }
        }

        // Build term lookup map (case-insensitive)
        const map = new Map<string, GlossaryTerm>()
        sortedTerms.forEach(t => map.set(t.term.toLowerCase(), t))

        // Build regex pattern with word boundaries
        const pattern = sortedTerms.map(t => escapeRegex(t.term)).join('|')
        const reg = new RegExp(`\\b(${pattern})\\b`, 'gi')

        return { regex: reg, termMap: map }
    }, [glossaryTerms])

    // Split text into parts (matched and unmatched)
    const parts = useMemo(() => {
        if (!regex || !text) return [{ text, isMatch: false, term: null }]

        const result: Array<{ text: string; isMatch: boolean; term: GlossaryTerm | null }> = []
        let lastIndex = 0
        let match: RegExpExecArray | null

        // Reset regex state
        regex.lastIndex = 0

        while ((match = regex.exec(text)) !== null) {
            // Add text before match
            if (match.index > lastIndex) {
                result.push({
                    text: text.slice(lastIndex, match.index),
                    isMatch: false,
                    term: null
                })
            }

            // Add matched term
            const matchedText = match[0]
            const term = termMap.get(matchedText.toLowerCase()) || null
            result.push({
                text: matchedText,
                isMatch: true,
                term
            })

            lastIndex = match.index + matchedText.length
        }

        // Add remaining text
        if (lastIndex < text.length) {
            result.push({
                text: text.slice(lastIndex),
                isMatch: false,
                term: null
            })
        }

        return result.length > 0 ? result : [{ text, isMatch: false, term: null }]
    }, [text, regex, termMap])

    const handleMouseEnter = (e: React.MouseEvent, term: GlossaryTerm) => {
        const rect = (e.target as HTMLElement).getBoundingClientRect()
        setHoveredTerm({
            term,
            x: rect.left,
            y: rect.bottom + 4
        })
    }

    const handleMouseLeave = () => {
        setHoveredTerm(null)
    }

    const handleClick = (term: GlossaryTerm) => {
        if (onInsertTranslation && term.definition) {
            onInsertTranslation(term.definition)
        }
    }

    return (
        <span className={className}>
            {parts.map((part, index) => (
                part.isMatch && part.term ? (
                    <span
                        key={index}
                        className="bg-yellow-100 text-yellow-800 px-0.5 rounded cursor-pointer border-b border-yellow-300 border-dashed hover:bg-yellow-200 transition-colors"
                        onMouseEnter={(e) => handleMouseEnter(e, part.term!)}
                        onMouseLeave={handleMouseLeave}
                        onClick={() => handleClick(part.term!)}
                        title={`${part.term.term} → ${part.term.definition}`}
                    >
                        {part.text}
                    </span>
                ) : (
                    <span key={index}>{part.text}</span>
                )
            ))}

            {/* Tooltip */}
            {hoveredTerm && (
                <div
                    className="fixed z-50 bg-slate-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg max-w-xs pointer-events-none"
                    style={{
                        left: Math.min(hoveredTerm.x, window.innerWidth - 200),
                        top: hoveredTerm.y
                    }}
                >
                    <div className="font-bold text-yellow-300">{hoveredTerm.term.term}</div>
                    <div className="text-emerald-300 mt-1">→ {hoveredTerm.term.definition}</div>
                    {hoveredTerm.term.context && (
                        <div className="text-slate-400 mt-1 italic text-[10px]">{hoveredTerm.term.context}</div>
                    )}
                    <div className="text-slate-500 mt-1 text-[10px]">点击插入译文</div>
                </div>
            )}
        </span>
    )
}
