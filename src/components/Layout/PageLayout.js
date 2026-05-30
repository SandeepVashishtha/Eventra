import { Outlet } from 'react-router-dom';

const PageLayout = () => {
  return (
    <div className="pt-20 md:pt-24 min-h-screen w-full">
      <Outlet />
    </div>
  );
};

export default PageLayout;
