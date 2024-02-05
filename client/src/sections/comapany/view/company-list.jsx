import { useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import { IconButton } from '@mui/material';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import Pagination from '@mui/material/Pagination';
import TablePagination from '@mui/material/TablePagination';
import axios from 'axios';

import { users } from 'src/_mock/user';
// import { useAuth } from 'src/context/AuthContext';
import { useSnackbar } from 'notistack';
import { RouterLink } from 'src/routes/components';
// import { useRouter } from 'src/routes/hooks';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

import TableNoData from '../table-no-data';
import CompanyTableRow from '../company-table-row';
import CompanyTableHead from '../company-table-head';
import TableEmptyRows from '../table-empty-rows';
import CompanyTableToolbar from '../company-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';

// ----------------------------------------------------------------------

export default function CompanyList() {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const [companies, setCompanies] = useState([]);

  const [info, setInfo] = useState({});

  const [page, setPage] = useState(1);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('employee_id');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [refresh, setRefresh] = useState(0);

  const action = useCallback(
    (snackbarId) => (
      <IconButton color="inherit" onClick={() => closeSnackbar(snackbarId)}>
        <Iconify icon="eva:close-outline" />
      </IconButton>
    ),
    [closeSnackbar]
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        await axios
          .get(`/api/company_list?page=${page}`)
          .then((response) => {
            if (response.data.status) {
              setCompanies(response.data.results);
              setInfo(response.data.info);
            }
          })
          .catch((error) => {
            enqueueSnackbar(error.response.data.message, { variant: 'error', action });
          });
      } catch (error) {
        enqueueSnackbar(error.message, { variant: 'error', action });
      }
    };

    fetchData();
  }, [page, refresh, action, enqueueSnackbar]);

  const handleSort = (event, id) => {
    const isAsc = orderBy === id && order === 'asc';
    if (id !== '') {
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    }
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = companies.map((n) => n.company_id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const dataFiltered = applyFilter({
    inputData: companies,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Employee List</Typography>

        <Stack direction="row" alignItems="center" gap={3}>
          <Button
            href="/companies/create"
            variant="contained"
            component={RouterLink}
            startIcon={<Iconify icon="eva:plus-fill" />}
          >
            New Company
          </Button>
        </Stack>
      </Stack>

      <Card>
        <CompanyTableToolbar
          numSelected={selected.length}
          filterName={filterName}
          onFilterName={handleFilterByName}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <CompanyTableHead
                order={order}
                orderBy={orderBy}
                rowCount={companies.length}
                numSelected={selected.length}
                onRequestSort={handleSort}
                onSelectAllClick={handleSelectAllClick}
                headLabel={[
                  { id: 'company_logo', label: 'Company Logo' },
                  { id: 'company_name', label: 'Company Name' },
                  { id: 'company_website', label: 'Company Website' },
                  { id: '' },
                ]}
              />
              <TableBody>
                {dataFiltered
                  // .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <CompanyTableRow
                      key={row.id}
                      setRefresh={setRefresh}
                      companyId={row.company_id}
                      companyLogo={row.company_logo}
                      companyName={row.company_name}
                      companyWebsite={row.company_website}
                      selected={selected.indexOf(row.company_id) !== -1}
                      handleClick={(event) => handleClick(event, row.company_id)}
                    />
                  ))}

                {/* <TableEmptyRows
                  height={77}
                  emptyRows={emptyRows(page, rowsPerPage, companies.length)}
                /> */}

                {notFound && <TableNoData query={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        {/* <TablePagination
          page={page}
          component="div"
          count={companies.length}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={handleChangeRowsPerPage}
        /> */}
        <Stack direction="row" alignItems="center" justifyContent="center" my={3} spacing={2}>
          <Pagination
            showFirstButton
            showLastButton
            count={info.totalPage}
            page={page}
            onChange={handleChangePage}
            variant="outlined"
            shape="rounded"
          />
        </Stack>
      </Card>
    </Container>
  );
}
