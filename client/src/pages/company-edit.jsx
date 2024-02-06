import { Helmet } from 'react-helmet-async';

import { CompanyEdit } from 'src/sections/comapany/view';
// --------------------------------------------------------------

export default function CompanyEditPage() {
  return (
    <>
      <Helmet>
        <title>Companies | Refex Contacts</title>
      </Helmet>
      
      <CompanyEdit/>
    </>
  );
}
