import { useEffect, useState } from "react";

const ReadingProgressBar = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const height =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;

      const percent = height > 0 ? (scrollTop / height) * 100 : 0;
      setProgress(percent);
    };

    window.addEventListener("scroll", updateProgress);
    updateProgress();

    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-transparent z-[9999]">
      <div
        className="h-full bg-indigo-600 transition-all duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ReadingProgressBar;