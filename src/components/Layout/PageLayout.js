import { Outlet } from 'react-router-dom';

const PageLayout = () => {
  return (
    <div className="pt-20 md:pt-24 min-h-screen w-full bg-slate-50 dark:bg-slate-950">
      <Outlet />
    </div>
  );
};

export default PageLayout;
