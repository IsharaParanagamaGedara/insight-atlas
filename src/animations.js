import { gsap } from "gsap";

const CONTENT_SELECTORS = [
  ".hero__meta",
  ".hero__eyebrow",
  ".hero__title-line",
  ".hero__title-accent",
  ".hero__description",
  ".hero__statistic",
  ".hero__actions",
];

function prefersReducedMotion() {
  return window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
}

export function setInitialAnimationState() {
  if (prefersReducedMotion()) {
    return;
  }

  gsap.set(".site-header", {
    y: -40,
    opacity: 0,
  });

  gsap.set(CONTENT_SELECTORS, {
    y: 35,
    opacity: 0,
  });

  gsap.set(".story-queue", {
    x: 70,
    opacity: 0,
  });

  gsap.set(".story-controls", {
    y: 35,
    opacity: 0,
  });

  gsap.set(".hero__side-label", {
    opacity: 0,
  });

  gsap.set(".hero__image", {
    scale: 1.12,
  });
}

export function playPageReveal() {
  if (prefersReducedMotion()) {
    gsap.set(
      [
        ".site-header",
        ...CONTENT_SELECTORS,
        ".story-queue",
        ".story-controls",
        ".hero__side-label",
      ],
      {
        clearProps: "all",
      },
    );

    return Promise.resolve();
  }

  const timeline = gsap.timeline({
    defaults: {
      ease: "power3.out",
    },
  });

  timeline
    .to(".site-header", {
      y: 0,
      opacity: 1,
      duration: 0.7,
    })
    .to(
      ".hero__image",
      {
        scale: 1.04,
        duration: 1.8,
        ease: "power2.out",
      },
      0,
    )
    .to(
      ".hero__meta",
      {
        y: 0,
        opacity: 1,
        duration: 0.55,
      },
      0.3,
    )
    .to(
      [
        ".hero__eyebrow",
        ".hero__title-line",
        ".hero__title-accent",
      ],
      {
        y: 0,
        opacity: 1,
        duration: 0.75,
        stagger: 0.09,
      },
      0.4,
    )
    .to(
      [
        ".hero__description",
        ".hero__statistic",
        ".hero__actions",
      ],
      {
        y: 0,
        opacity: 1,
        duration: 0.65,
        stagger: 0.09,
      },
      0.65,
    )
    .to(
      ".story-queue",
      {
        x: 0,
        opacity: 1,
        duration: 0.8,
      },
      0.65,
    )
    .to(
      ".story-controls",
      {
        y: 0,
        opacity: 1,
        duration: 0.65,
      },
      0.85,
    )
    .to(
      ".hero__side-label",
      {
        opacity: 1,
        duration: 0.6,
      },
      1,
    );

  return timeline.then();
}

export function animateStoryTransition({
  updateStory,
  direction = 1,
}) {
  if (typeof updateStory !== "function") {
    return Promise.resolve();
  }

  if (prefersReducedMotion()) {
    updateStory();
    return Promise.resolve();
  }

  const horizontalDirection = direction >= 0 ? 1 : -1;

  const timeline = gsap.timeline({
    defaults: {
      ease: "power3.inOut",
    },
  });

  timeline
    .to(CONTENT_SELECTORS, {
      x: -30 * horizontalDirection,
      y: -12,
      opacity: 0,
      duration: 0.32,
      stagger: 0.025,
    })
    .to(
      ".story-queue",
      {
        x: 45 * horizontalDirection,
        opacity: 0,
        duration: 0.32,
      },
      0,
    )
    .fromTo(
      ".story-transition",
      {
        scaleX: 0,
        transformOrigin:
          horizontalDirection > 0
            ? "right center"
            : "left center",
      },
      {
        scaleX: 1,
        duration: 0.52,
      },
      0.05,
    )
    .add(() => {
      updateStory();

      gsap.set(CONTENT_SELECTORS, {
        x: 32 * horizontalDirection,
        y: 16,
        opacity: 0,
      });

      gsap.set(".story-queue", {
        x: 50 * horizontalDirection,
        opacity: 0,
      });

      gsap.set(".hero__image", {
        scale: 1.1,
      });
    })
    .set(".story-transition", {
      transformOrigin:
        horizontalDirection > 0
          ? "left center"
          : "right center",
    })
    .to(".story-transition", {
      scaleX: 0,
      duration: 0.52,
    })
    .to(
      ".hero__image",
      {
        scale: 1.04,
        duration: 1.1,
        ease: "power2.out",
      },
      "-=0.42",
    )
    .to(
      CONTENT_SELECTORS,
      {
        x: 0,
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.055,
        ease: "power3.out",
      },
      "-=0.48",
    )
    .to(
      ".story-queue",
      {
        x: 0,
        opacity: 1,
        duration: 0.55,
        ease: "power3.out",
      },
      "-=0.48",
    )
    .fromTo(
      ".queue-card",
      {
        y: 25,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: 0.45,
        stagger: 0.07,
        ease: "power3.out",
      },
      "-=0.42",
    );

  return timeline.then();
}

export function animateProgressBar(
  progressPercentage,
) {
  const duration = prefersReducedMotion() ? 0 : 0.65;

  return gsap.to(".story-progress__bar", {
    width: `${progressPercentage}%`,
    duration,
    ease: "power2.out",
    overwrite: true,
  });
}

export function animateQueueSelection(card) {
  if (!card || prefersReducedMotion()) {
    return;
  }

  gsap.fromTo(
    card,
    {
      scale: 1,
    },
    {
      scale: 0.97,
      duration: 0.12,
      repeat: 1,
      yoyo: true,
      ease: "power2.inOut",
    },
  );
}