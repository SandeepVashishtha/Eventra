import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";

export function useSurveySimulator(questions, feedbackPool) {
  const [totalSubmissions, setTotalSubmissions] = useState(142);
  const [completionRate, setCompletionRate] = useState(87.3);
  const [simulatedData, setSimulatedData] = useState({});
  const [textFeed, setTextFeed] = useState([]);

  // 🔥 FIX 1: Dependency Hashing to prevent Infinite Render Loops.
  // By tracking the stringified content, we prevent the useEffect from firing
  // endlessly if the parent component passes unmemoized array references.
  const questionsHash = JSON.stringify(questions);
  const feedbackHash = JSON.stringify(feedbackPool);

  // Initialize simulated data once or if questions length changes
  useEffect(() => {
    // Safety guard in case undefined is passed
    const safeQuestions = questions || [];
    const safeFeedback = feedbackPool || [];
    
    const initialData = {};
    const textComments = [];

    safeQuestions.forEach((q) => {
      if (q.type === "rating") {
        // Biased rating counts: [5-star, 4-star, 3-star, 2-star, 1-star]
        initialData[q.id] = {
          5: Math.floor(Math.random() * 20) + 50,
          4: Math.floor(Math.random() * 15) + 30,
          3: Math.floor(Math.random() * 10) + 10,
          2: Math.floor(Math.random() * 5) + 3,
          1: Math.floor(Math.random() * 3) + 1,
        };
      } else if (q.type === "choice") {
        const optionVotes = {};
        q.options?.forEach((opt) => {
          optionVotes[opt] = Math.floor(Math.random() * 40) + 10;
        });
        initialData[q.id] = optionVotes;
      } else if (q.type === "text") {
        // Grab 3 random comments from our pool
        const shuffled = [...safeFeedback].sort(() => 0.5 - Math.random());
        textComments.push({
          questionId: q.id,
          questionText: q.questionText,
          comments: shuffled.slice(0, 3).map((comment, index) => ({
            id: `${q.id}-${index}`,
            author: ["Aravind S.", "Meera N.", "Zoya A.", "Kabir D.", "Sara K."][index] || "Anonymous",
            text: comment,
            time: `${index * 4 + 2} mins ago`,
          })),
        });
      }
    });

    setSimulatedData(initialData);
    setTextFeed(textComments);
    // Use the content hashes as the true dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionsHash, feedbackHash]);

  // 🔥 FIX 2: Wrapped in useCallback to provide a stable reference signature.
  // Prevents downstream components from pointlessly re-rendering.
  const handleSimulateSubmission = useCallback(() => {
    const safeQuestions = questions || [];
    const safeFeedback = feedbackPool || [];

    if (safeQuestions.length === 0) {
      toast.warn("Please add some questions first before simulating submissions!");
      return;
    }

    setTotalSubmissions((prev) => prev + 1);
    setCompletionRate((prev) =>
      parseFloat((Math.min(99.4, prev + (Math.random() * 0.4 - 0.1))).toFixed(1))
    );

    setSimulatedData((prev) => {
      const updated = { ...prev };
      safeQuestions.forEach((q) => {
        if (q.type === "rating") {
          const score = Math.random() > 0.4 ? (Math.random() > 0.4 ? 5 : 4) : 3;
          updated[q.id] = {
            ...updated[q.id],
            [score]: (updated[q.id]?.[score] || 0) + 1,
          };
        } else if (q.type === "choice") {
          if (q.options && q.options.length > 0) {
            const randomOpt = q.options[Math.floor(Math.random() * q.options.length)];
            updated[q.id] = {
              ...updated[q.id],
              [randomOpt]: (updated[q.id]?.[randomOpt] || 0) + 1,
            };
          }
        }
      });
      return updated;
    });

    // Add a comment to the scrolling feed if there are text questions
    const textQuestions = safeQuestions.filter((q) => q.type === "text");
    if (textQuestions.length > 0 && safeFeedback.length > 0) {
      const targetQ = textQuestions[Math.floor(Math.random() * textQuestions.length)];
      const randomAuthor = [
        "Aarav S.", "Priya M.", "Rohan V.", "Sneha P.", "Karan J.", "Aditya R.", "Ishaan R."
      ][Math.floor(Math.random() * 7)];
      const randomComment = safeFeedback[Math.floor(Math.random() * safeFeedback.length)];

      setTextFeed((prev) =>
        prev.map((item) => {
          if (item.questionId === targetQ.id) {
            return {
              ...item,
              comments: [
                {
                  id: `new-${Date.now()}`,
                  author: randomAuthor,
                  text: randomComment,
                  time: "Just now",
                },
                ...item.comments.slice(0, 4),
              ],
            };
          }
          return item;
        })
      );
    }

    toast.success("🚀 Simulator: Injected a new active survey submission record!");
  }, [questions, feedbackPool]);

  return {
    totalSubmissions,
    completionRate,
    simulatedData,
    textFeed,
    handleSimulateSubmission,
  };
}