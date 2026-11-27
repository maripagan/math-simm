import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildHistogramBins,
  generateDeterministicSample,
  mean,
  median,
  mode,
  parseNumberList,
  range,
  stdDev,
  summarize,
  variance,
} from './statisticsMath';

test('mean calculates arithmetic average', () => {
  assert.equal(mean([10, 20, 30]), 20);
  assert.equal(mean([2, 2, 2, 14]), 5);
  assert.ok(Number.isNaN(mean([])));
});

test('median handles odd and even arrays regardless of order', () => {
  assert.equal(median([30, 10, 20]), 20);
  assert.equal(median([4, 1, 9, 2]), 3);
  assert.equal(median([2.0, 2.2, 2.4, 2.5, 2.5, 2.8, 3.0, 14.6]), 2.5);
  assert.ok(Number.isNaN(median([])));
});

test('mode detects amodal, unimodal, and multimodal distributions', () => {
  const amodal = mode([1, 2, 3, 4]);
  assert.equal(amodal.kind, 'amodal');
  assert.deepEqual(amodal.values, []);

  const unimodal = mode([2, 2, 3, 4, 5]);
  assert.equal(unimodal.kind, 'unimodal');
  assert.deepEqual(unimodal.values, [2]);
  assert.equal(unimodal.frequency, 2);

  const multimodal = mode([1, 1, 3, 3, 5]);
  assert.equal(multimodal.kind, 'multimodal');
  assert.deepEqual(multimodal.values, [1, 3]);
  assert.equal(multimodal.frequency, 2);
});

test('range, variance, and population stdDev are accurate', () => {
  const data = [2, 4, 4, 4, 5, 5, 7, 9];
  assert.equal(range(data), 7);
  assert.equal(mean(data), 5);
  assert.equal(variance(data), 4);
  assert.equal(stdDev(data), 2);
});

test('summarize aggregates all metrics consistently', () => {
  const stats = summarize([10, 10, 20, 30, 30]);
  assert.equal(stats.count, 5);
  assert.equal(stats.min, 10);
  assert.equal(stats.max, 30);
  assert.equal(stats.mean, 20);
  assert.equal(stats.median, 20);
  assert.equal(stats.mode.kind, 'multimodal');
  assert.equal(stats.range, 20);
});

test('buildHistogramBins sums to sample count within domain', () => {
  const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const bins = buildHistogramBins(data, 5, 0, 10);
  assert.equal(bins.length, 5);
  const total = bins.reduce((acc, b) => acc + b.count, 0);
  assert.equal(total, data.length);
});

test('generateDeterministicSample hits target mean and stdDev accurately', () => {
  const sample = generateDeterministicSample(25, 3.5, 160, 0, 7);
  assert.equal(sample.length, 160);
  assert.ok(Math.abs(mean(sample) - 25) < 1e-6);
  assert.ok(Math.abs(stdDev(sample) - 3.5) < 1e-6);
});

test('parseNumberList parses comma, semicolon, and space-separated numbers', () => {
  assert.deepEqual(parseNumberList('10, 20; 30 40.5'), [10, 20, 30, 40.5]);
});
