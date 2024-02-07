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

// import { useAuth } from 'src/context/AuthContext';
import { useSnackbar } from 'notistack';
import { RouterLink } from 'src/routes/components';
// import { useRouter } from 'src/routes/hooks';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

import TableNoData from '../downloads-table/table-no-data';
import DownloadsTableRow from '../downloads-table/downloads-table-row';
import DownloadsTableHead from '../downloads-table/downloads-table-head';
import TableEmptyRows from '../downloads-table/table-empty-rows';
import DownloadsTableToolbar from '../downloads-table/downloads-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../downloads-table/utils';

// --------------------------------------------------------------------------------------

export default function DownloadsList() {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const [downloadRequests, setDownloadRequests] = useState([]);

  const [info, setInfo] = useState({});

  const [page, setPage] = useState(0);

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
          .get(`/api/employees/inactive`)
          .then((response) => {
            if (response.data.status) {
              setDownloadRequests(response.data.results);
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
      const newSelecteds = downloadRequests.map((n) => n.employee_id);
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
    inputData: downloadRequests,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;
  return (
    <Container maxWidth="xl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Inactive Employee list</Typography>

        <Stack direction="row" alignItems="center" gap={3}>
          <Button
            href="/employees/list"
            variant="contained"
            color="error"
            component={RouterLink}
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
          >
            Back to active list
          </Button>
        </Stack>
      </Stack>

      <Card>
        <DownloadsTableToolbar
          numSelected={selected.length}
          filterName={filterName}
          onFilterName={handleFilterByName}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <DownloadsTableHead
                order={order}
                orderBy={orderBy}
                rowCount={downloadRequests.length}
                numSelected={selected.length}
                onRequestSort={handleSort}
                onSelectAllClick={handleSelectAllClick}
                headLabel={[
                  { id: 'employee_id', label: 'Employee ID' },
                  { id: 'employee_name', label: 'Name' },
                  { id: 'mobile_number', label: 'Mobile Number' },
                  { id: 'landline', label: 'Landline' },
                  { id: 'designation', label: 'designation' },
                  { id: 'company_name', label: 'Company' },
                  { id: 'branch_name', label: 'Branch' },
                  // { id: 'landline', label: 'Landline', align: 'center' },
                  { id: 'is_active', label: 'Status' },
                  { id: '' },
                ]}
              />
              <TableBody>
                {dataFiltered
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <DownloadsTableRow
                      key={row.id}
                      setRefresh={setRefresh}
                      employeeId={row.employee_id}
                      name={row.employee_name}
                      email={row.email}
                      photo={row.photo}
                      designation={row.designation}
                      mobileNumber={row.mobile_number}
                      landline={row.landline}
                      company={row.company.company_name}
                      branch={row.branch.branch_name}
                      status={row.is_active}
                      selected={selected.indexOf(row.employee_id) !== -1}
                      handleClick={(event) => handleClick(event, row.employee_id)}
                    />
                  ))}

                {/* <TableEmptyRows
                  height={77}
                  emptyRows={emptyRows(page, rowsPerPage, downloadRequests.length)}
                /> */}

                {notFound && <TableNoData query={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          page={page}
          component="div"
          count={downloadRequests.length}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
        <Stack direction="row" alignItems="center" justifyContent="center" my={3} spacing={2}>
          {/* <Pagination
            showFirstButton
            showLastButton
            count={info.totalPage}
            page={page}
            onChange={handleChangePage}
            variant="outlined"
            shape="rounded"
          /> */}
        </Stack>
      </Card>
    </Container>
  );
}
