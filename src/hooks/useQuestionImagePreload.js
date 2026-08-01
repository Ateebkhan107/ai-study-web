"use client";

import { useEffect } from "react";

function collectQuestionAssetUrls(question) {
  if (!question) return [];

  const urls = [
    question.question_image,
    question.explanation_image,
    ...(question.option_images || []),
    question.option_a_image,
    question.option_b_image,
    question.option_c_image,
    question.option_d_image,
  ].filter(Boolean);

  return [...new Set(urls)];
}

export function useQuestionImagePreload(questions, currentIndex, lookAhead = 2) {
  useEffect(() => {
    if (!Array.isArray(questions) || questions.length === 0) return;

    const preloadWindow = questions.slice(
      currentIndex,
      Math.min(questions.length, currentIndex + lookAhead + 1)
    );

    preloadWindow.forEach((question) => {
      collectQuestionAssetUrls(question).forEach((url) => {
        const image = new Image();
        image.decoding = "async";
        image.src = url;
      });
    });
  }, [questions, currentIndex, lookAhead]);
}
