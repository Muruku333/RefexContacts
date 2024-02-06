import { Helmet } from 'react-helmet-async';

import { EmployeeVCard } from 'src/sections/employee/view';
// --------------------------------------------------------------

export default function EmployeeViewPage() {
  return (
    <>
      <Helmet>
        <title>Employee Visiting Card | Refex Contacts</title>
      </Helmet>
      
      <EmployeeVCard/>
    </>
  );
}
