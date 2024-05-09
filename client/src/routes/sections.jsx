import PropTypes from 'prop-types';
import { lazy, Suspense } from 'react';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';

import LogoutPage from 'src/pages/logout';
import { useAuth } from 'src/context/AuthContext';
import DashboardLayout from 'src/layouts/dashboard';

export const EmployeeListPage = lazy(() => import('src/pages/employee-list'));
export const EmployeeCreatePage = lazy(() => import('src/pages/employee-create'));
export const EmployeeViewPage = lazy(() => import('src/pages/employee-view'));
export const EmployeeEditPage = lazy(() => import('src/pages/employee-edit'));
export const EmployeeInactiveListPage = lazy(() => import('src/pages/employee-inactive'));
export const EmployeeVCard = lazy(()=>import('src/pages/employee-vcard'));
export const CompanyListPage = lazy(() => import('src/pages/company-list'));
export const CompanyCreatePage = lazy(()=>import('src/pages/company-create'));
export const CompanyEditPage = lazy(()=>import('src/pages/company-edit'));
export const PrintRequestListPage = lazy(()=>import('src/pages/print-request'));
export const IndexPage = lazy(() => import('src/pages/app'));
export const BlogPage = lazy(() => import('src/pages/blog'));
export const UserPage = lazy(() => import('src/pages/user'));
export const LoginPage = lazy(() => import('src/pages/login'));
export const ForgotPasswordPage=lazy(()=>import('src/pages/forgot-password'));
export const ResetPasswordPage=lazy(()=>import('src/pages/reset-password'));
export const ProductsPage = lazy(() => import('src/pages/products'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));

// ----------------------------------------------------------------------

export default function Router() {
  const { isAuthenticated, user } = useAuth();
  // console.log(user);
  const PrivateRoute = ({ element, accessType, ...rest }) => {
    // Check if the user is authenticated
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    // Check if the user type matches the required access type
    if (accessType && user && user.type !== accessType) {
      return <Navigate to="/404" />;
    }

    // Render the protected route
    return element;
  };

  PrivateRoute.propTypes = {
    element: PropTypes.element,
    accessType: PropTypes.string,
  };

  const routes = useRoutes([
    {
      element: (
        <PrivateRoute
          element={
            <DashboardLayout>
              <Suspense>
                <Outlet />
              </Suspense>
            </DashboardLayout>
          }
        />
      ),
      children: [
        { element: <Navigate to="/employees" />, index: true },
        {
          path: 'employees',
          children: [
            { element: <Navigate to="/employees/list" />, index: true },
            { path: 'list', element: <EmployeeListPage /> },
            { path: 'create', element: <EmployeeCreatePage /> },
            { path: 'view/:employeeId', element: <EmployeeViewPage /> },
            { path: 'edit/:employeeId', element: <EmployeeEditPage /> },
            { path: 'inactive', element: <EmployeeInactiveListPage /> },
          ],
        },
        {
          path: 'companies',
          children: [
            { element: <Navigate to="/companies/list" />, index: true },
            { path: 'list', element: <CompanyListPage /> },
            { path: 'create', element: <CompanyCreatePage /> },
            { path: 'edit/:companyId', element: <CompanyEditPage /> },
          ],
        },
        {
          path: 'print_requests',
          element: <PrintRequestListPage />,
        },
        // {
        //   path: 'change_password',
        //   element: <IndexPage />,
        // },
        {
          path: 'logout',
          element: <LogoutPage />,
        },
      ],
    },
    {
      path: 'vcard/:employeeId',
      element: <EmployeeVCard/>,
    },
    // {
    //   path:'blog',
    //   element:<BlogPage/>,
    // },
    {
      path: 'login',
      element: isAuthenticated ? <Navigate to="/employees" replace /> : <LoginPage />,
    },
    {
      path:'forgot_password',
      element:<ForgotPasswordPage/>,
    },
    {
      path:'reset_password/:token',
      element:<ResetPasswordPage/>
    },
    {
      path: '404',
      element: <Page404 />,
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);

  return routes;
}
