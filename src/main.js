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
};

function formatNumber(number) {
  return String(number).padStart(2, "0");
}

function setActiveAccent(accent) {
  document.documentElement.style.setProperty(
    "--active-accent",
    accent,
  );
}

function renderStory(index) {
  const story = stories[index];

  if (!story) {
    console.error(`Story at index ${index} was not found.`);
    return;
  }

  currentStoryIndex = index;

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
}

function getUpcomingStories() {
  const upcomingStories = [];

  for (let offset = 1; offset < stories.length; offset += 1) {
    const index =
      (currentStoryIndex + offset) % stories.length;

    upcomingStories.push({
      ...stories[index],
      originalIndex: index,
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
        >
          <div
            class="queue-card__image"
            style="background-image: url('${story.image}')"
            aria-hidden="true"
          ></div>

          <div class="queue-card__overlay"></div>

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

renderStory(currentStoryIndex);