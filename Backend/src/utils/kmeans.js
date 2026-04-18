// K-Means clustering utilities

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
export function kMeansClustering(points, k = 3, iterations = 15) {
  if (!points || points.length === 0) return [];
  
  // Clamp k: must be at least 1, at most the number of points
  k = Math.max(1, Math.min(k, points.length));

  if (points.length <= k) {
    return points.map((p, i) => ({ 
      id: i, 
      points: [p],
      center: p.vector 
    }));
  }

  // 1. K-means++ initialization: pick centroids greedily so they start spread out
  const firstIdx = Math.floor(Math.random() * points.length);
  let centroids = [[...points[firstIdx].vector]];

  while (centroids.length < k) {
    // For each point, find distance to nearest existing centroid
    const distances = points.map(p => {
      let minD = Infinity;
      for (const c of centroids) {
        const d = cosineDistance(p.vector, c);
        if (d < minD) minD = d;
      }
      return minD;
    });
    // Pick the point with the maximum distance as the next centroid
    let maxIdx = 0;
    for (let i = 1; i < distances.length; i++) {
      if (distances[i] > distances[maxIdx]) maxIdx = i;
    }
    centroids.push([...points[maxIdx].vector]);
  }

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
