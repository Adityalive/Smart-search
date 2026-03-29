import _ from 'lodash';

/**
 * Basic Cosine Distance calculation
 */
function cosineDistance(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 1;
  let dotProduct = 0, normA = 0, normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 1;
  const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  return 1 - similarity; // distance is inverse of similarity
}

/**
 * Simple K-Means implementation for vector embeddings
 * points: array of { vector: number[], ...data }
 * k: number of clusters to form
 */
export function kMeansClustering(points, k = 3, iterations = 5) {
  if (!points || points.length === 0) return [];
  if (points.length <= k) {
    return points.map((p, i) => ({ 
      id: i, 
      points: [p],
      center: p.vector 
    }));
  }

  // 1. Initialize centroids randomly from points
  let centroids = _.sampleSize(points, k).map(p => [...p.vector]);
  let groups = [];

  for (let iter = 0; iter < iterations; iter++) {
    // Reset groups for this iteration
    groups = Array.from({ length: k }, () => []);

    // 2. Assign each point to the nearest centroid
    for (const point of points) {
      let minDist = Infinity;
      let closestCentroidIndex = 0;

      for (let i = 0; i < k; i++) {
        const dist = cosineDistance(point.vector, centroids[i]);
        if (dist < minDist) {
          minDist = dist;
          closestCentroidIndex = i;
        }
      }
      groups[closestCentroidIndex].push(point);
    }

    // 3. Re-calculate centroids based on the mean of assigned points
    for (let i = 0; i < k; i++) {
      if (groups[i].length > 0) {
        const dimensions = centroids[0].length;
        const newCentroid = new Array(dimensions).fill(0);
        
        for (const p of groups[i]) {
          for (let d = 0; d < dimensions; d++) {
            newCentroid[d] += p.vector[d];
          }
        }
        
        centroids[i] = newCentroid.map(val => val / groups[i].length);
      }
    }
  }

  // Return formatted clusters (filtering out empty ones)
  return groups
    .map((pts, i) => ({ id: i, points: pts, center: centroids[i] }))
    .filter(cluster => cluster.points.length > 0);
}
