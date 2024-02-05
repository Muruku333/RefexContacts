import { Helmet } from 'react-helmet-async';

import { CompanyList } from 'src/sections/comapany/view';
// --------------------------------------------------------------

export default function CompanyListPage() {
  return (
    <>
      <Helmet>
        <title>Comapanies | Refex Contacts</title>
      </Helmet>
      
      <CompanyList/>
    </>
  );
}
