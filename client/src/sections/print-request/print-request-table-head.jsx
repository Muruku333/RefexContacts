import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableSortLabel from '@mui/material/TableSortLabel';

import { useAuth } from 'src/context/AuthContext';

import { visuallyHidden } from './utils';

// ----------------------------------------------------------------------

export default function PrintRequestTableHead({
  order,
  orderBy,
  rowCount,
  headLabel,
  numSelected,
  onRequestSort,
  onSelectAllClick,
}) {
  const { user } = useAuth();

  const onSort = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {user.user_type !== 'HR' && (
          <TableCell padding="checkbox">
            <Checkbox
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={onSelectAllClick}
            />
          </TableCell>
        )}

        {headLabel.map((headCell) => {
          if (headCell.id === 'total_employees') {
            return (
              <TableCell
                key={headCell.id}
                align={headCell.align || 'left'}
                sx={{ width: headCell.width, minWidth: headCell.minWidth }}
              >
                {headCell.label}
              </TableCell>
            );
          }
          return (
            <TableCell
              key={headCell.id}
              align={headCell.align || 'left'}
              sortDirection={orderBy === headCell.id ? order : false}
              sx={{ width: headCell.width, minWidth: headCell.minWidth }}
            >
              <TableSortLabel
                hideSortIcon
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={onSort(headCell.id)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box sx={{ ...visuallyHidden }}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            </TableCell>
          );
        })}
      </TableRow>
    </TableHead>
  );
}

PrintRequestTableHead.propTypes = {
  order: PropTypes.oneOf(['asc', 'desc']),
  orderBy: PropTypes.string,
  rowCount: PropTypes.number,
  headLabel: PropTypes.array,
  numSelected: PropTypes.number,
  onRequestSort: PropTypes.func,
  onSelectAllClick: PropTypes.func,
};
