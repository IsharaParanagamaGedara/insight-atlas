export function preloadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(source);

    image.onerror = () => {
      reject(
        new Error(`Failed to load image: ${source}`),
      );
    };

    image.src = source;
  });
}

export async function preloadImages(sources) {
  const uniqueSources = [...new Set(sources)];

  const results = await Promise.allSettled(
    uniqueSources.map((source) =>
      preloadImage(source),
    ),
  );

  const loaded = [];
  const failed = [];

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      loaded.push(uniqueSources[index]);
    } else {
      failed.push(uniqueSources[index]);
    }
  });

  return {
    loaded,
    failed,
  };
}