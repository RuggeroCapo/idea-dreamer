'use client';

import { useEffect, useRef, useState } from 'react';
import { IdeaCard } from './IdeaCard';
import type { Idea } from '@/types';

interface VirtualIdeaGridProps {
  ideas: Idea[];
  onIdeaClick: (ideaId: string) => void;
}

export function VirtualIdeaGrid({ ideas, onIdeaClick }: VirtualIdeaGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const [columns, setColumns] = useState(3);

  // Calculate columns based on container width
  useEffect(() => {
    const updateColumns = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.offsetWidth;
      if (width < 768) setColumns(1);
      else if (width < 1024) setColumns(2);
      else setColumns(3);
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  // Virtual scrolling logic
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const scrollTop = window.scrollY;
      const viewportHeight = window.innerHeight;
      const itemHeight = 280; // Approximate card height + gap
      const rowHeight = itemHeight;
      
      const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - 2);
      const endRow = Math.ceil((scrollTop + viewportHeight) / rowHeight) + 2;
      
      const start = startRow * columns;
      const end = Math.min(ideas.length, endRow * columns);

      setVisibleRange({ start, end });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [ideas.length, columns]);

  const totalRows = Math.ceil(ideas.length / columns);
  const itemHeight = 280;
  const totalHeight = totalRows * itemHeight;

  const visibleIdeas = ideas.slice(visibleRange.start, visibleRange.end);
  const offsetTop = Math.floor(visibleRange.start / columns) * itemHeight;

  return (
    <div ref={containerRef} style={{ minHeight: `${totalHeight}px`, position: 'relative' }}>
      <div
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        style={{
          position: 'absolute',
          top: `${offsetTop}px`,
          left: 0,
          right: 0,
        }}
      >
        {visibleIdeas.map((idea) => (
          <IdeaCard
            key={idea.ideaId}
            idea={idea}
            onClick={() => onIdeaClick(idea.ideaId)}
          />
        ))}
      </div>
    </div>
  );
}
