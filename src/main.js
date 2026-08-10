import "./styles/main.scss";

import { stories } from "./data.js";

let currentStoryIndex = 0;

const elements = {
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

  storyQueue: document.querySelector(".story-queue__list"),

  storyQueueCount: document.querySelector(
    ".story-queue__count",
  ),

  previousButton: document.querySelector(
    ".story-control--previous",
  ),

  nextButton: document.querySelector(
    ".story-control--next",
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

function updateProgress() {
  const currentPosition = currentStoryIndex + 1;
  const progressPercentage =
    (currentPosition / stories.length) * 100;

  elements.progressFraction.textContent =
    `${formatNumber(currentPosition)} / ` +
    `${formatNumber(stories.length)}`;

  elements.progressBar.style.width =
    `${progressPercentage}%`;

  elements.progressTrack.setAttribute(
    "aria-valuenow",
    String(currentPosition),
  );

  elements.progressTrack.setAttribute(
    "aria-valuemax",
    String(stories.length),
  );
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
  const upcomingStories = getUpcomingStories().slice(0, 3);

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
                ${formatNumber(story.originalIndex + 1)}
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

function showNextStory() {
  renderStory(currentStoryIndex + 1);
}

function showPreviousStory() {
  renderStory(currentStoryIndex - 1);
}

function openStoryFromQueue(event) {
  const queueCard = event.target.closest(".queue-card");

  if (!queueCard) {
    return;
  }

  const selectedIndex = Number(
    queueCard.dataset.storyIndex,
  );

  if (!Number.isInteger(selectedIndex)) {
    return;
  }

  renderStory(selectedIndex);
}

function handleQueueKeyboard(event) {
  if (
    event.key !== "Enter" &&
    event.key !== " "
  ) {
    return;
  }

  const queueCard = event.target.closest(".queue-card");

  if (!queueCard) {
    return;
  }

  event.preventDefault();

  const selectedIndex = Number(
    queueCard.dataset.storyIndex,
  );

  if (Number.isInteger(selectedIndex)) {
    renderStory(selectedIndex);
  }
}

function handleDocumentKeyboard(event) {
  const activeElement = document.activeElement;
  const activeTagName =
    activeElement?.tagName.toLowerCase();

  const isTyping =
    activeTagName === "input" ||
    activeTagName === "textarea" ||
    activeElement?.isContentEditable;

  if (isTyping) {
    return;
  }

  if (event.key === "ArrowRight") {
    showNextStory();
  }

  if (event.key === "ArrowLeft") {
    showPreviousStory();
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

  elements.storyQueue.addEventListener(
    "click",
    openStoryFromQueue,
  );

  elements.storyQueue.addEventListener(
    "keydown",
    handleQueueKeyboard,
  );

  document.addEventListener(
    "keydown",
    handleDocumentKeyboard,
  );
}

function initializeApplication() {
  if (stories.length === 0) {
    console.error("No stories are available.");
    return;
  }

  attachEventListeners();
  renderStory(currentStoryIndex);
}

initializeApplication();