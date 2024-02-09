import { Helmet } from 'react-helmet-async';

import { PrintRequestListView } from 'src/sections/print-request/view';

// ----------------------------------------------------------------------

export default function PrintRequestListPage() {
  return (
    <>
      <Helmet>
        <title> Print Requests | Refex Contacts</title>
      </Helmet>

      <PrintRequestListView />
    </>
  );
}
