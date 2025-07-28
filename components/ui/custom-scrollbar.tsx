'use client';
import React, { useEffect, useRef, useState } from 'react';

export default function CustomScrollbar({ children }: { children: React.ReactNode }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollThumbRef = useRef<HTMLDivElement>(null);
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const thumbHeightRef = useRef(40); // Store thumbHeight in a ref

  useEffect(() => {
    const container = scrollContainerRef.current;
    const thumb = scrollThumbRef.current;
    const track = scrollTrackRef.current;
    
    if (!container || !thumb || !track) return;

    const updateScrollThumb = () => {
      const { scrollHeight, clientHeight, scrollTop } = container;
      
      // Modern thumb sizing algorithm - more responsive to content length
      const thumbHeight = Math.max(
        Math.min(
          Math.pow(clientHeight / scrollHeight, 0.7) * clientHeight, 
          clientHeight * 0.6
        ), 
        40
      );
      
      // Store the current thumbHeight in the ref
      thumbHeightRef.current = thumbHeight;
      
      const thumbTop = (scrollTop / (scrollHeight - clientHeight)) * (clientHeight - thumbHeight);
      
      requestAnimationFrame(() => {
        thumb.style.height = `${thumbHeight}px`;
        thumb.style.transform = `translateY(${thumbTop}px)`;
      });
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return; // Only left mouse button
      
      // Check if click is on track but not on thumb
      const trackRect = track.getBoundingClientRect();
      const thumbRect = thumb.getBoundingClientRect();
      
      if (
        e.clientX >= trackRect.left && 
        e.clientX <= trackRect.right
      ) {
        if (
          e.clientY >= thumbRect.top && 
          e.clientY <= thumbRect.bottom
        ) {
          // Clicked on thumb - start dragging
          e.preventDefault();
          setIsDragging(true);
          
          const startY = e.clientY;
          const startScrollTop = container.scrollTop;
          
          const handleMouseMove = (e: MouseEvent) => {
            const deltaY = e.clientY - startY;
            const scrollRatio = deltaY / (container.clientHeight - thumbHeightRef.current);
            container.scrollTop = startScrollTop + scrollRatio * (container.scrollHeight - container.clientHeight);
          };
          
          const handleMouseUp = () => {
            setIsDragging(false);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
          };
          
          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        } else {
          // Clicked on track but not on thumb - jump to position
          const clickRatio = (e.clientY - trackRect.top) / trackRect.height;
          container.scrollTop = clickRatio * (container.scrollHeight - container.clientHeight);
        }
      }
    };

    const handleScroll = () => updateScrollThumb();
    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    const observer = new MutationObserver(updateScrollThumb);
    observer.observe(container, { childList: true, subtree: true });

    container.addEventListener('scroll', handleScroll);
    track.addEventListener('mousedown', handleMouseDown);
    track.addEventListener('mouseenter', handleMouseEnter);
    track.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', updateScrollThumb);
    updateScrollThumb();

    return () => {
      observer.disconnect();
      container.removeEventListener('scroll', handleScroll);
      track.removeEventListener('mousedown', handleMouseDown);
      track.removeEventListener('mouseenter', handleMouseEnter);
      track.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', updateScrollThumb);
    };
  }, [isDragging]);

  return (
    <div className="relative h-full">
      <div 
        ref={scrollContainerRef} 
        className="h-full overflow-y-auto pr-3 scrollbar-hide"
      >
        {children}
      </div>
      <div 
        ref={scrollTrackRef}
        className={`absolute right-0 top-2 bottom-2 w-3 rounded-full transition-all duration-300 ${isHovering || isDragging ? 'bg-gray-200/70 dark:bg-gray-700/70' : 'bg-transparent'}`}
      >
        <div 
          ref={scrollThumbRef}
          className={`absolute right-0 w-2 mx-auto left-0 bg-blue-500/80 dark:bg-blue-400/80 rounded-full 
            transition-all duration-200 ease-out
            ${isDragging ? 'w-3 !bg-blue-600 dark:!bg-blue-300 shadow-lg' : ''}
            ${isHovering && !isDragging ? 'hover:w-3 hover:bg-blue-600/90 dark:hover:bg-blue-300/90' : ''}
            ${!isHovering && !isDragging ? 'opacity-0' : 'opacity-100'}`}
        />
      </div>
    </div>
  );
}