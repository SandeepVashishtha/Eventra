const SectionHeader = ({ title, subtitle, center = true }) => {
  return (
    <div className={`mb-10 ${center ? "text-center" : "text-left"} `}>
      <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-white">
        {title}
      </h2>

      {subtitle && (
        <p className="mx-auto mt-3 max-w-2xl text-base text-gray-600 md:text-lg dark:text-gray-400">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;
