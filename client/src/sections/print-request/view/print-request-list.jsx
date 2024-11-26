import axios from 'axios';
// import { useAuth } from 'src/context/AuthContext';
import { useSnackbar } from 'notistack';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import { styled } from '@mui/material/styles';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { RouterLink } from 'src/routes/components';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

import { emptyRows } from '../utils';
import TableEmptyRows from '../table-empty-rows';
import PrintRequestTableRow from '../print-request-table-row';
import PrintRequestTableHead from '../print-request-table-head';
import PrintRequestTableToolbar from '../print-request-table-toolbar';

// ----------------------------------------------------------------------

const HEADER_LABEL = [
  { id: 'list' },
  { id: 'pr.request_id', label: 'Request ID' },
  { id: 'total_employees', label: 'Total Employees' },
  { id: 'cu.email', label: 'Created By' },
  { id: 'cu.created_at', label: 'Created At' },
  // { id: 'landline', label: 'Landline', align: 'center' },
  { id: 'pr.status', label: 'Status' },
  { id: 'menu' },
];

const StyledTabs = styled((props) => (
  <Tabs {...props} TabIndicatorProps={{ children: <span className="MuiTabs-indicatorSpan" /> }} />
))(({ theme }) => ({
  '& .MuiTabs-indicator': {
    height: '2.5px',
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  '& .MuiTabs-indicatorSpan': {
    // maxWidth: 40,
    width: '75%',
    backgroundColor: theme.palette.primary.dark,
  },
}));

const StyledTab = styled((props) => <Tab disableRipple {...props} />)(({ theme }) => ({
  minHeight: 0,
  textTransform: 'none',
  fontWeight: theme.typography.fontWeightSemiBold,
  fontSize: theme.typography.pxToRem(15),
  marginRight: theme.spacing(2),
  color: 'text.secondary',
  '&.Mui-selected': {
    color: theme.palette.primary.dark,
  },
  '&.Mui-focusVisible': {
    backgroundColor: 'rgba(100, 95, 228, 0.32)',
  },
}));

export default function PrintRequestList() {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const [printRequests, setPrintRequests] = useState([]);

  const [info, setInfo] = useState({});

  const [tapValue, setTapValue] = useState(0);

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('desc');

  const [selected, setSelected] = useState([]);

  const [filterField, setFilterField] = useState('pr.id');

  const [orderBy, setOrderBy] = useState('pr.id');

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
          .get(
            `/api/print_request?field=${filterField}&search=${filterName}&sort=${orderBy}&order=${order}&page=${page}`
          )
          .then((response) => {
            if (response.data.status) {
              setPrintRequests(response.data.results);
              setInfo(response.data.info);
              // console.log(response.data.results);
            }
          })
          .catch((error) => {
            setPrintRequests([]);
            // console.log(error);
            setInfo(error.response.data.info);
            // enqueueSnackbar(error.response.data.message, { variant: 'error', action });
          });
      } catch (error) {
        setPrintRequests([]);
        setInfo({});
        enqueueSnackbar(error.message, { variant: 'error', action });
      }
    };

    fetchData();
  }, [filterField, filterName, orderBy, order, page, refresh, action, enqueueSnackbar]);

  const handleTapChange = (event, newValue) => {
    switch (newValue) {
      case 0:
        setFilterField('pr.id');
        setFilterName('');
        break;
      case 1:
        setFilterField('pr.status');
        setFilterName('pending');
        break;
      case 2:
        setFilterField('pr.status');
        setFilterName('rejected');
        break;
      case 3:
        setFilterField('pr.status');
        setFilterName('approved');
        break;
      default:
        setFilterField('pr.id');
        setFilterName('');
        break;
    }
    setTapValue(newValue);
  };

  const handleSort = (event, id) => {
    const isAsc = orderBy === id && order === 'asc';
    if (id !== '') {
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    }
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = printRequests.map((n) => n.request_id);
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
    setFilterField('pr.request_id');
    setPage(0);
    setFilterName(event.target.value);
  };

  const dataFiltered = printRequests;

  // const dataFiltered = applyFilter({
  //   inputData: printRequests,
  //   comparator: getComparator(order, orderBy),
  //   filterName,
  // });

  // const notFound = !dataFiltered.length && !!filterName;

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Visiting Card Print Requests</Typography>

        <Button
          href="/employees/list"
          variant="contained"
          component={RouterLink}
          // color="error"
          startIcon={<Iconify icon="eva:arrow-back-fill" />}
        >
          To Employees List
        </Button>
      </Stack>

      <Card>
        <StyledTabs
          value={tapValue}
          onChange={handleTapChange}
          aria-label="styled tabs example"
          sx={{ px: 2 }}
        >
          <StyledTab
            icon={
              <Label color="info" variant={tapValue === 0 ? 'filled' : 'soft'}>
                {info.all}
              </Label>
            }
            iconPosition="end"
            label="All"
          />
          <StyledTab
            icon={
              <Label color="warning" variant={tapValue === 1 ? 'filled' : 'soft'}>
                {info.pending}
              </Label>
            }
            iconPosition="end"
            label="Pending"
          />
          <StyledTab
            icon={
              <Label color="error" variant={tapValue === 2 ? 'filled' : 'soft'}>
                {info.rejected}
              </Label>
            }
            iconPosition="end"
            label="Rejected"
          />
          <StyledTab
            icon={
              <Label color="success" variant={tapValue === 3 ? 'filled' : 'soft'}>
                {info.approved}
              </Label>
            }
            iconPosition="end"
            label="Approved"
          />
        </StyledTabs>
        <Divider sx={{ borderStyle: 'dashed' }} />
        <PrintRequestTableToolbar
          numSelected={selected.length}
          filterName={filterName}
          onFilterName={handleFilterByName}
          selectedIDS={selected}
          setSelectedIDS={setSelected}
          setRefresh={setRefresh}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <PrintRequestTableHead
                order={order}
                orderBy={orderBy}
                rowCount={printRequests.length}
                numSelected={selected.length}
                onRequestSort={handleSort}
                onSelectAllClick={handleSelectAllClick}
                headLabel={HEADER_LABEL}
              />
              <TableBody>
                {dataFiltered
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <PrintRequestTableRow
                      key={row.id}
                      requestId={row.request_id}
                      printEmployees={row.print_employees}
                      createdBy={row.created.email}
                      createdAt={new Date(row.created.created_at).toLocaleString('en-IN')}
                      status={row.status}
                      supportDocument={row.support_document}
                      setRefresh={setRefresh}
                      selected={selected.indexOf(row.request_id) !== -1}
                      handleClick={(event) => handleClick(event, row.request_id)}
                    />
                  ))}

                <TableEmptyRows
                  height={77}
                  emptyRows={emptyRows(page, rowsPerPage, printRequests.length)}
                />

                {/* {notFound && <TableNoData query={filterName} />} */}
                {!(dataFiltered.length > 0) && (
                  <TableRow sx={{ height: 300 }}>
                    <TableCell colSpan={13}>
                      <Stack spacing={1}>
                        <Box
                          component="img"
                          src="/assets/icons/ic_content.svg"
                          sx={{ height: 120, mx: 'auto' }}
                        />
                        <Typography
                          textAlign="center"
                          variant="subtitle1"
                          color="text.secondary"
                          component="span"
                        >
                          No Data
                        </Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          page={page}
          component="div"
          count={printRequests.length}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
    </Container>
  );
}
