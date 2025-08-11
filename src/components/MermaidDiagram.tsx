'use client';

import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

type MermaidDiagramProps = {
  chart: string;
};

export default function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
    });
    
    if (containerRef.current) {
      mermaid.render('mermaid-diagram', chart).then(({ svg }) => {
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      });
    }
  }, [chart]);

  return <div className="mermaid-container" ref={containerRef} />;
}