import { memo } from "react";

const SectionHeader = memo(function SectionHeader({
  title,
  subtitle,
  center = true,
}) {
  return (
    <div
      className={`
        mb-10
        ${center ? "text-center" : "text-left"}
      `}
    >
      <h2
        className="
          text-3xl
          md:text-4xl
          font-bold
          text-gray-900
          dark:text-white
          tracking-tight
        "
      >
        {title}
      </h2>

      {subtitle && (
        <p
          className="
            mt-3
            text-base
            md:text-lg
            text-gray-600
            dark:text-gray-400
            max-w-2xl
            mx-auto
          "
        >
          {subtitle}
        </p>
      )}
    </div>
  );
});

export default SectionHeader;
