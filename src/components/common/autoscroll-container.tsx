import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import React from "react";
import { useEffect, useRef, useState, useCallback } from "react";

interface AutoScrollContainerProps
  extends React.ComponentPropsWithoutRef<"div"> {
  className?: string;
}

/**
 * A reusable scroll container that automatically handles scrolling and
 * provides a "Scroll to Bottom" button when the user scrolls up.
 */
export const AutoScrollContainer = ({
  className,
  children,
  ...props
}: AutoScrollContainerProps) => {
  const { containerRef, contentRef, scrollToBottom, isScrolledToBottom } =
    useAutoScroll();

  return (
    <div className="relative w-full h-full">
      <div
        ref={containerRef}
        className={cn("overflow-y-auto", className)}
        {...props}
      >
        <div ref={contentRef} className="flex flex-col gap-y-3 px-3">
          {children}
        </div>
      </div>

      {/* Scroll to Bottom Button */}
      {!isScrolledToBottom && (
        <button
          className="absolute bottom-6 right-6 bg-zinc-500/50 text-white p-2 rounded-full shadow-md hover:bg-zinc-600/80 transition"
          onClick={scrollToBottom}
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

/**
 * Hook to handle automatic scrolling with user override and resize detection.
 */
export function useAutoScroll({ scrolledToBottomThreshold = 100 } = {}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const lastScrollWasUpRef = useRef(false);
  const lastHeightRef = useRef(0);
  const lastScrollTopRef = useRef(0);

  // Scroll to bottom function
  const scrollToBottom = useCallback(() => {
    if (!containerRef.current) return;

    containerRef.current.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    });

    // Update last scroll position to prevent detecting as "user scroll"
    lastScrollTopRef.current = containerRef.current.scrollTop;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  // Check if user manually scrolled up (ignores downward programmatic scrolls)
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom =
      scrollHeight - scrollTop <= clientHeight + scrolledToBottomThreshold;

    // Ignore downward (programmatic) scrolls
    if (scrollTop < lastScrollTopRef.current) {
      lastScrollWasUpRef.current = true;
    } else {
      lastScrollWasUpRef.current = false;
    }

    // Set scrolled to bottom state
    setIsScrolledToBottom(isAtBottom);
    lastScrollTopRef.current = scrollTop;
  }, [scrolledToBottomThreshold]);

  // Resize observer to detect new messages & auto-scroll if user hasn't scrolled up
  useEffect(() => {
    const content = contentRef.current;
    const container = containerRef.current;
    if (!content || !container) return;

    const observer = new ResizeObserver(() => {
      const currentHeight = content.scrollHeight;

      // if content height is the same as last height, do nothing
      if (currentHeight <= lastHeightRef.current) return;

      // Check if scrolled to bottom
      const { scrollTop, scrollHeight, clientHeight } = container;

      // If last scroll was up, do not scroll to bottom
      if (lastScrollWasUpRef.current) {
        lastScrollWasUpRef.current = false;
        return;
      }

      const isAtBottom =
        scrollHeight - scrollTop <= clientHeight + scrolledToBottomThreshold;

      if (isAtBottom) {
        scrollToBottom();
      }

      lastHeightRef.current = currentHeight; // Update height reference
    });

    observer.observe(content);
    return () => observer.disconnect();
  }, [scrollToBottom, scrolledToBottomThreshold]);

  // Attach scroll event listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return {
    containerRef,
    contentRef,
    scrollToBottom,
    isScrolledToBottom,
  };
}
