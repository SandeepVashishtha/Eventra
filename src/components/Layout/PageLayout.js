
import { Outlet } from 'react-router-dom';

const PageLayout = ({ children }) => {
  return (
    <div className="pt-20 md:pt-24 min-h-screen w-full" data-testid="page-layout-container">
      {children || <Outlet />}
    </div>
  );
};

export default PageLayout;
