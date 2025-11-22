"use client";

import { useState, useRef, useEffect } from "react";
import { DeliveryRequest } from "@/lib/types";
import { RequestCard } from "./RequestCard";

interface TaskCarouselProps {
  tasks: DeliveryRequest[];
  currentUserId?: string;
  showActions?: boolean;
  onAccept?: (taskId: string) => void;
}

export function TaskCarousel({
  tasks,
  currentUserId,
  showActions = false,
  onAccept,
}: TaskCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentIndex(0); // Reset to first when tasks change
  }, [tasks]);

  const goToNext = () => {
    if (currentIndex < tasks.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No tasks available</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Carousel Container */}
      <div
        ref={carouselRef}
        className="overflow-hidden rounded-lg"
        style={{ touchAction: "pan-y" }}
      >
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {tasks.map((task, index) => (
            <div
              key={task.id || index}
              className="w-full flex-shrink-0 px-2"
            >
              <RequestCard
                request={task}
                currentUserId={currentUserId}
                showActions={showActions}
                onAccept={onAccept ? () => task.id && onAccept(task.id) : undefined}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Dots */}
      {tasks.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {tasks.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "w-8 bg-indigo-600"
                  : "w-2 bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Navigation Arrows */}
      {tasks.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            disabled={currentIndex === 0}
            className={`absolute left-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${
              currentIndex === 0 ? "hidden" : ""
            }`}
            aria-label="Previous task"
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={goToNext}
            disabled={currentIndex === tasks.length - 1}
            className={`absolute right-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${
              currentIndex === tasks.length - 1 ? "hidden" : ""
            }`}
            aria-label="Next task"
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}

      {/* Task Counter */}
      {tasks.length > 1 && (
        <div className="text-center mt-2 text-sm text-gray-500">
          {currentIndex + 1} of {tasks.length}
        </div>
      )}
    </div>
  );
}

