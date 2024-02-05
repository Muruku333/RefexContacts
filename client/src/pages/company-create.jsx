import { Helmet } from 'react-helmet-async';

import {CompanyCreate } from 'src/sections/comapany/view';
// --------------------------------------------------------------

export default function CompanyCreatePage() {
  return (
    <>
      <Helmet>
        <title>Companies | Refex Contacts</title>
      </Helmet>
      
      <CompanyCreate/>
    </>
  );
}
