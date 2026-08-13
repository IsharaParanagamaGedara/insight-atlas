import "./styles/main.scss";

import { stories } from "./data.js";

import {
  animateProgressBar,
  animateQueueSelection,
  animateStoryTransition,
  playPageReveal,
  setInitialAnimationState,
} from "./animations.js";

import {
  preloadImages,
} from "./utils/preloadImages.js";

function prefersReducedMotion() {
  return window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
}

let currentStoryIndex = 0;
let isAnimating = false;
let isAutoPlaying = !prefersReducedMotion();
let autoplayTimer = null;

const AUTOPLAY_DELAY = 5000;

const elements = {
  hero: document.querySelector(".hero"),
  heroImage: document.querySelector(".hero__image"),
  category: document.querySelector(".hero__category"),
  storyNumber: document.querySelector(".hero__number"),
  eyebrow: document.querySelector(".hero__eyebrow"),
  titleLine: document.querySelector(".hero__title-line"),
  titleAccent: document.querySelector(".hero__title-accent"),
  description: document.querySelector(".hero__description"),

  statisticValue: document.querySelector(
    ".hero__statistic-value",
  ),

  statisticDescription: document.querySelector(
    ".hero__statistic-description",
  ),

  storyQueue: document.querySelector(
    ".story-queue__list",
  ),

  storyQueueCount: document.querySelector(
    ".story-queue__count",
  ),

  previousButton: document.querySelector(
    ".story-control--previous",
  ),

  nextButton: document.querySelector(
    ".story-control--next",
  ),

  autoplayButton: document.querySelector(
    ".story-control--autoplay",
  ),

  progressFraction: document.querySelector(
    ".story-progress__fraction",
  ),

  progressTrack: document.querySelector(
    ".story-progress__track",
  ),

  progressBar: document.querySelector(
    ".story-progress__bar",
  ),
};

function formatNumber(number) {
  return String(number).padStart(2, "0");
}

function normalizeStoryIndex(index) {
  return (index + stories.length) % stories.length;
}

function setActiveAccent(accent) {
  document.documentElement.style.setProperty(
    "--active-accent",
    accent,
  );
}

function setControlsDisabled(disabled) {
  elements.previousButton.disabled = disabled;
  elements.nextButton.disabled = disabled;

  document
    .querySelectorAll(".queue-card")
    .forEach((card) => {
      card.setAttribute(
        "aria-disabled",
        String(disabled),
      );
    });
}

function updateProgress() {
  const currentPosition = currentStoryIndex + 1;

  const progressPercentage =
    (currentPosition / stories.length) * 100;

  elements.progressFraction.textContent =
    `${formatNumber(currentPosition)} / ` +
    `${formatNumber(stories.length)}`;

  elements.progressTrack.setAttribute(
    "aria-valuenow",
    String(currentPosition),
  );

  elements.progressTrack.setAttribute(
    "aria-valuemax",
    String(stories.length),
  );

  elements.progressTrack.setAttribute(
    "aria-valuetext",
    `Story ${currentPosition} of ${stories.length}`,
  );

  animateProgressBar(progressPercentage);
}

function getUpcomingStories() {
  const upcomingStories = [];

  for (
    let offset = 1;
    offset < stories.length;
    offset += 1
  ) {
    const storyIndex = normalizeStoryIndex(
      currentStoryIndex + offset,
    );

    upcomingStories.push({
      ...stories[storyIndex],
      originalIndex: storyIndex,
    });
  }

  return upcomingStories;
}

function renderStoryQueue() {
  const upcomingStories =
    getUpcomingStories().slice(0, 3);

  elements.storyQueueCount.textContent =
    `${formatNumber(currentStoryIndex + 1)} / ` +
    `${formatNumber(stories.length)}`;

  elements.storyQueue.innerHTML = upcomingStories
    .map(
      (story) => `
        <article
          class="queue-card"
          data-story-index="${story.originalIndex}"
          tabindex="0"
          role="button"
          aria-label="Open ${story.titleLine1} ${story.titleLine2}"
          aria-disabled="false"
        >
          <div
            class="queue-card__image"
            style="background-image: url('${story.image}')"
            aria-hidden="true"
          ></div>

          <div
            class="queue-card__overlay"
            aria-hidden="true"
          ></div>

          <div class="queue-card__content">
            <div class="queue-card__meta">
              <span>
                ${formatNumber(
                  story.originalIndex + 1,
                )}
              </span>

              <span>${story.category}</span>
            </div>

            <h2 class="queue-card__title">
              ${story.titleLine1}
              <span>${story.titleLine2}</span>
            </h2>

            <span class="queue-card__action">
              View story
              <span aria-hidden="true">↗</span>
            </span>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderStory(index) {
  const normalizedIndex = normalizeStoryIndex(index);
  const story = stories[normalizedIndex];

  if (!story) {
    console.error(
      `Story at index ${normalizedIndex} was not found.`,
    );

    return;
  }

  currentStoryIndex = normalizedIndex;

  setActiveAccent(story.accent);

  elements.heroImage.style.backgroundImage = `
    linear-gradient(
      rgba(7, 17, 31, 0.08),
      rgba(7, 17, 31, 0.08)
    ),
    url("${story.image}")
  `;

  elements.category.textContent = story.category;
  elements.storyNumber.textContent = story.storyNumber;
  elements.eyebrow.textContent = story.eyebrow;
  elements.titleLine.textContent = story.titleLine1;
  elements.titleAccent.textContent = story.titleLine2;
  elements.description.textContent = story.description;
  elements.statisticValue.textContent = story.statistic;

  elements.statisticDescription.textContent =
    story.statisticDescription;

  renderStoryQueue();
  updateProgress();
}

async function changeStory(
  targetIndex,
  direction = 1,
) {
  if (isAnimating) {
    return;
  }

  const normalizedTarget =
    normalizeStoryIndex(targetIndex);

  if (normalizedTarget === currentStoryIndex) {
    return;
  }

  isAnimating = true;
  setControlsDisabled(true);
  stopAutoplayTimer();

  try {
    await animateStoryTransition({
      direction,
      updateStory: () => {
        renderStory(normalizedTarget);
      },
    });
  } finally {
    isAnimating = false;
    setControlsDisabled(false);

    if (isAutoPlaying) {
      startAutoplayTimer();
    }
  }
}

function showNextStory() {
  return changeStory(currentStoryIndex + 1, 1);
}

function showPreviousStory() {
  return changeStory(currentStoryIndex - 1, -1);
}

function determineQueueDirection(selectedIndex) {
  const forwardDistance =
    normalizeStoryIndex(
      selectedIndex - currentStoryIndex,
    );

  const backwardDistance =
    normalizeStoryIndex(
      currentStoryIndex - selectedIndex,
    );

  return forwardDistance <= backwardDistance ? 1 : -1;
}

function openStoryFromQueue(event) {
  const queueCard = event.target.closest(
    ".queue-card",
  );

  if (!queueCard || isAnimating) {
    return;
  }

  const selectedIndex = Number(
    queueCard.dataset.storyIndex,
  );

  if (!Number.isInteger(selectedIndex)) {
    return;
  }

  animateQueueSelection(queueCard);

  const direction =
    determineQueueDirection(selectedIndex);

  changeStory(selectedIndex, direction);
}

function handleQueueKeyboard(event) {
  if (
    event.key !== "Enter" &&
    event.key !== " "
  ) {
    return;
  }

  const queueCard = event.target.closest(
    ".queue-card",
  );

  if (!queueCard || isAnimating) {
    return;
  }

  event.preventDefault();

  const selectedIndex = Number(
    queueCard.dataset.storyIndex,
  );

  if (!Number.isInteger(selectedIndex)) {
    return;
  }

  const direction =
    determineQueueDirection(selectedIndex);

  changeStory(selectedIndex, direction);
}

function handleDocumentKeyboard(event) {
  const activeElement = document.activeElement;
  const activeTagName =
    activeElement?.tagName.toLowerCase();

  const isTyping =
    activeTagName === "input" ||
    activeTagName === "textarea" ||
    activeElement?.isContentEditable;

  if (isTyping || isAnimating) {
    return;
  }

  if (event.key === "ArrowRight") {
    event.preventDefault();
    showNextStory();
  }

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    showPreviousStory();
  }

  if (event.key === " ") {
    const isButtonFocused =
      activeTagName === "button";

    if (!isButtonFocused) {
      event.preventDefault();
      toggleAutoplay();
    }
  }
}

function updateAutoplayButton() {
  elements.autoplayButton.setAttribute(
    "aria-pressed",
    String(isAutoPlaying),
  );

  elements.autoplayButton.setAttribute(
    "aria-label",
    isAutoPlaying
      ? "Pause automatic story playback"
      : "Start automatic story playback",
  );

  elements.autoplayButton.classList.toggle(
    "is-paused",
    !isAutoPlaying,
  );
}

function stopAutoplayTimer() {
  if (autoplayTimer !== null) {
    window.clearTimeout(autoplayTimer);
    autoplayTimer = null;
  }
}

function startAutoplayTimer() {
  stopAutoplayTimer();

  if (
    !isAutoPlaying ||
    document.hidden ||
    isAnimating
  ) {
    return;
  }

  autoplayTimer = window.setTimeout(() => {
    showNextStory();
  }, AUTOPLAY_DELAY);
}

function pauseAutoplayTemporarily() {
  stopAutoplayTimer();
}

function resumeAutoplay() {
  if (isAutoPlaying) {
    startAutoplayTimer();
  }
}

function toggleAutoplay() {
  isAutoPlaying = !isAutoPlaying;

  updateAutoplayButton();

  if (isAutoPlaying) {
    startAutoplayTimer();
  } else {
    stopAutoplayTimer();
  }
}

function handleVisibilityChange() {
  if (document.hidden) {
    stopAutoplayTimer();
  } else if (isAutoPlaying) {
    startAutoplayTimer();
  }
}

function attachEventListeners() {
  elements.nextButton.addEventListener(
    "click",
    showNextStory,
  );

  elements.previousButton.addEventListener(
    "click",
    showPreviousStory,
  );

  elements.autoplayButton.addEventListener(
    "click",
    toggleAutoplay,
  );

  elements.storyQueue.addEventListener(
    "click",
    openStoryFromQueue,
  );

  elements.storyQueue.addEventListener(
    "keydown",
    handleQueueKeyboard,
  );

  elements.hero.addEventListener(
    "mouseenter",
    pauseAutoplayTemporarily,
  );

  elements.hero.addEventListener(
    "mouseleave",
    resumeAutoplay,
  );

  elements.hero.addEventListener(
    "focusin",
    pauseAutoplayTemporarily,
  );

  elements.hero.addEventListener(
    "focusout",
    resumeAutoplay,
  );

  document.addEventListener(
    "keydown",
    handleDocumentKeyboard,
  );

  document.addEventListener(
    "visibilitychange",
    handleVisibilityChange,
  );
}

async function initializeApplication() {
  if (stories.length === 0) {
    console.error("No stories are available.");
    return;
  }

  setInitialAnimationState();
  updateAutoplayButton();
  attachEventListeners();

  const imageSources = stories.map(
    (story) => story.image,
  );

  const imageResult = await preloadImages(
    imageSources,
  );

  if (imageResult.failed.length > 0) {
    console.warn(
      "Some images could not be loaded:",
      imageResult.failed,
    );
  }

  renderStory(currentStoryIndex);

  await playPageReveal();

  startAutoplayTimer();
}

initializeApplication();