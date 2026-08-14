// Test to verify the streak calculation fix
// This simulates the bug and the fix

console.log("Testing streak calculation fix...\n");

// Simulate the OLD buggy behavior
function oldBuggyBehavior() {
  console.log("=== OLD (BUGGY) BEHAVIOR ===");
  
  let prevContributorsRef = { current: [] };
  let streaks = {};
  
  // First update: contributors = [A, B, C]
  const contributors1 = [
    { username: "A", points: 100 },
    { username: "B", points: 90 },
    { username: "C", points: 80 }
  ];
  
  // Simulate the effect running
  setStreaksOld(prevContributorsRef, contributors1);
  console.log("After first update:", JSON.stringify(streaks, null, 2));
  
  // Second update: contributors = [A, C, B] (C moved up)
  const contributors2 = [
    { username: "A", points: 100 },
    { username: "C", points: 95 },  // C now has more points
    { username: "B", points: 80 }
  ];
  
  setStreaksOld(prevContributorsRef, contributors2);
  console.log("After second update (C moved up):", JSON.stringify(streaks, null, 2));
  console.log("BUG: rankDifference is 0 for everyone!\n");
  
  function setStreaksOld(prevContributorsRef, contributors) {
    // This is the buggy code
    const prevRanks = new Map(prevContributorsRef.current.map((c, idx) => [c.username, idx + 1]));
    
    contributors.forEach((c, newIdx) => {
      const newRank = newIdx + 1;
      const prevRank = prevRanks.get(c.username);
      const rankDifference = prevRank !== undefined ? prevRank - newRank : 0;
      
      if (prevRank !== undefined) {
        const consecutiveUp = rankDifference > 0 ? 1 : 0;
        const onFire = rankDifference >= 3 || consecutiveUp >= 3;
        streaks[c.username] = { consecutiveUp, onFire, rankDifference };
      } else {
        streaks[c.username] = { consecutiveUp: 0, onFire: false, rankDifference: 0 };
      }
    });
    
    // Update ref AFTER setStreaks
    prevContributorsRef.current = contributors;
  }
}

// Simulate the NEW fixed behavior
function newFixedBehavior() {
  console.log("=== NEW (FIXED) BEHAVIOR ===");
  
  let prevContributorsRef = { current: [] };
  let streaks = {};
  
  // First update: contributors = [A, B, C]
  const contributors1 = [
    { username: "A", points: 100 },
    { username: "B", points: 90 },
    { username: "C", points: 80 }
  ];
  
  // Simulate the effect running
  setStreaksNew(prevContributorsRef, contributors1);
  console.log("After first update:", JSON.stringify(streaks, null, 2));
  
  // Second update: contributors = [A, C, B] (C moved up)
  const contributors2 = [
    { username: "A", points: 100 },
    { username: "C", points: 95 },  // C now has more points
    { username: "B", points: 80 }
  ];
  
  setStreaksNew(prevContributorsRef, contributors2);
  console.log("After second update (C moved up):", JSON.stringify(streaks, null, 2));
  console.log("FIXED: rankDifference is correct!\n");
  
  function setStreaksNew(prevContributorsRef, contributors) {
    // This is the fixed code
    const prevContributors = prevContributorsRef.current;  // Capture BEFORE
    
    const prevRanks = new Map(prevContributors.map((c, idx) => [c.username, idx + 1]));
    
    contributors.forEach((c, newIdx) => {
      const newRank = newIdx + 1;
      const prevRank = prevRanks.get(c.username);
      const rankDifference = prevRank !== undefined ? prevRank - newRank : 0;
      
      if (prevRank !== undefined) {
        const consecutiveUp = rankDifference > 0 ? 1 : 0;
        const onFire = rankDifference >= 3 || consecutiveUp >= 3;
        streaks[c.username] = { consecutiveUp, onFire, rankDifference };
      } else {
        streaks[c.username] = { consecutiveUp: 0, onFire: false, rankDifference: 0 };
      }
    });
    
    // Update ref AFTER
    prevContributorsRef.current = contributors;
  }
}

oldBuggyBehavior();
newFixedBehavior();
