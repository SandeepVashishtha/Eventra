import ScrollToTop from './ScrollToTop';
import { Outlet } from 'react-router-dom';

const PageLayout = ({ children }) => {
 return (
    <div className="min-h-screen w-full pt-20 md:pt-24" data-testid="page-layout-c">
      {children || <Outlet />}
      <ScrollToTop />
    </div>
  );
};

export default PageLayout;
