import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const contributorsSrc = readFileSync(
  path.resolve(__dirname, '../src/components/Contributors.js'),
  'utf8',
);

const carouselSrc = readFileSync(
  path.resolve(
    __dirname,
    '../src/Pages/Home/components/ContributorsCarousel.js',
  ),
  'utf8',
);

describe('Contributors Throttling Contracts', () => {
  it('does not define or export throttleProfileFetch in Contributors.js', () => {
    assert.ok(
      !contributorsSrc.includes('export const throttleProfileFetch'),
      'throttleProfileFetch helper definition should be removed from Contributors.js',
    );
  });

  it('does not call throttleProfileFetch in Contributors.js fetchGitHubProfile', () => {
    assert.ok(
      !contributorsSrc.includes('await throttleProfileFetch()'),
      'throttleProfileFetch call should be removed from fetchGitHubProfile in Contributors.js',
    );
  });

  it('uses staggered map index setTimeout for allContributors mapping in Contributors.js', () => {
    assert.ok(
      contributorsSrc.includes('idx * PROFILE_FETCH_DELAY_MS'),
      'Staggered setTimeout using map index must be present in Contributors.js',
    );
  });
});

describe('ContributorsCarousel Throttling Contracts', () => {
  it('does not define throttleProfileFetch in ContributorsCarousel.js', () => {
    assert.ok(
      !carouselSrc.includes('const throttleProfileFetch'),
      'throttleProfileFetch helper definition should be removed from ContributorsCarousel.js',
    );
  });

  it('does not call throttleProfileFetch in ContributorsCarousel.js fetchGitHubProfile', () => {
    assert.ok(
      !carouselSrc.includes('await throttleProfileFetch()'),
      'throttleProfileFetch call should be removed from fetchGitHubProfile in ContributorsCarousel.js',
    );
  });

  it('uses staggered map index setTimeout inside fetchInBatches call in ContributorsCarousel.js', () => {
    assert.ok(
      carouselSrc.includes('idx * (BATCH_DELAY_MS / PROFILE_BATCH_SIZE)'),
      'Staggered setTimeout using map index must be present inside fetchInBatches call in ContributorsCarousel.js',
    );
  });
});
