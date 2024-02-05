import { Helmet } from 'react-helmet-async';

import { EmployeeInactiveList } from 'src/sections/employee/view';
// --------------------------------------------------------------

export default function EmployeeInactivePage() {
  return (
    <>
      <Helmet>
        <title>Employees | Refex Contacts</title>
      </Helmet>
      
      <EmployeeInactiveList/>
    </>
  );
}
